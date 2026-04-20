# Pattern: Xử lý API gọi khi làm việc với Input Search/Dropdown

## 🎯 Tổng quan
Khi có input field cho phép user gõ để search và dropdown hiển thị kết quả từ API, cần xử lý đặc biệt để:
1. Tránh gọi API quá nhiều (debounce)
2. Tránh ghi đè kết quả cũ bằng request chậm (cancel old request)
3. Tránh re-render không cần thiết (không depend vào results)
4. Tránh setState trong effect gây cascade render

---

## ❌ Anti-patterns thường gặp

### Lỗi 1: useEffect phụ thuộc vào results
```tsx
// ❌ SAI - Gây loop vô tận
useEffect(() => {
  fetchUsers(debouncedKeyword)
}, [debouncedKeyword, userResults]) // ❌ userResults gây loop
```

**Tại sao sai?**
- fetchUsers thay đổi userResults
- userResults trong dep array → trigger effect lại
- Lặp vô tận

### Lỗi 2: Không cancel request cũ
```tsx
// ❌ SAI - Request A chậm, request B nhanh
// Kết quả B thừa → request A ghi đè kết quả B
const fetchUsers = async (keyword) => {
  const res = await api.search(keyword)
  setResults(res.data) // ❌ Không check xem còn valid không
}
```

### Lỗi 3: Gọi API khi keyword rỗng
```tsx
// ❌ SAI - Gọi API với keyword=""
useEffect(() => {
  if (!debouncedKeyword) return // ❌ Quên check
  fetchUsers(debouncedKeyword)
}, [debouncedKeyword])
```

### Lỗi 4: setState trong effect
```tsx
// ❌ SAI - React rule cấm
useEffect(() => {
  if (!isOpen) {
    setFormState(INITIAL) // ❌ setState trong effect
    setKeyword("")
  }
}, [isOpen])
```

**Fix:** Reset khi close, không trong effect trigger bằng isOpen

### Lỗi 5: Gọi API trong render path
```tsx
// ❌ SAI - Gọi API mỗi lần render
<input onChange={() => {
  const users = await fetchUsers(keyword) // ❌ Async trong handler
  setResults(users)
}} />
```

---

## ✅ Pattern chuẩn

### Cấp độ 1: Custom Hook với debounce + cancel

```tsx
// hooks/use-user-search.ts
export interface IUserSearchResult<T> {
  isSearching: boolean
  results: T[]
  search: (keyword: string) => Promise<void>        // Debounce search
  searchImmediately: (keyword: string) => Promise<void> // Immediate (prefetch)
  clearResults: () => void                          // Reset state
}

export function useUserSearch<T>(
  fetchFn: (keyword: string, signal?: AbortSignal) => Promise<T[]>,
  debounceMs = 300,
  options: { allowEmptyKeyword?: boolean } = {}
): IUserSearchResult<T> {
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState<T[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedKeyword = useDebouncedValue(keyword, debounceMs)
  const controllerRef = useRef<AbortController | null>(null)
  const skipDebouncedKeywordRef = useRef<string | null>(null)

  const executeSearch = useCallback(
    async (searchKeyword: string) => {
      const trimmedKeyword = searchKeyword.trim()
      const normalizedKeyword = options.allowEmptyKeyword 
        ? searchKeyword 
        : trimmedKeyword

      // Không call API nếu keyword rỗng
      if (!normalizedKeyword) {
        if (controllerRef.current) {
          controllerRef.current.abort()
        }
        setResults([])
        setIsSearching(false)
        return
      }

      // Cancel request cũ
      if (controllerRef.current) {
        controllerRef.current.abort()
      }

      const controller = new AbortController()
      controllerRef.current = controller
      setIsSearching(true)

      try {
        const data = await fetchFn(normalizedKeyword, controller.signal)

        // Chỉ update nếu request này chưa bị cancel
        if (!controller.signal.aborted) {
          setResults(data)
        }
      } catch (error) {
        // Ignore abort error (request bị cancel cố ý)
        if (error instanceof Error && error.name === "AbortError") {
          return
        }

        console.error("Search error:", error)
        if (!controller.signal.aborted) {
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    },
    [options.allowEmptyKeyword, fetchFn]
  )

  // Debounce effect: gọi khi debouncedKeyword đổi
  // ✅ KHÔNG depend vào results để tránh loop
  useEffect(() => {
    if (skipDebouncedKeywordRef.current === debouncedKeyword) {
      skipDebouncedKeywordRef.current = null
      return
    }

    void executeSearch(debouncedKeyword)
  }, [debouncedKeyword, executeSearch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [])

  const search = useCallback(async (newKeyword: string) => {
    setKeyword(newKeyword)
  }, [])

  const searchImmediately = useCallback(async (newKeyword: string) => {
    setKeyword(newKeyword)
    skipDebouncedKeywordRef.current = newKeyword
    await executeSearch(newKeyword)
  }, [executeSearch])

  const clearResults = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    setKeyword("")
    setResults([])
    setIsSearching(false)
  }, [])

  return { isSearching, results, search, searchImmediately, clearResults }
}
```

### Cấp độ 2: API layer truyền AbortSignal

```tsx
// api/project-api.ts
export const getProjectOwnerOptions = async (input: {
  keyword: string
  page?: number
  size?: number
  signal?: AbortSignal  // ✅ Nhận signal để cancel
}): Promise<IProjectOwnerOption[]> => {
  const response = await api.get<IApiResponse<IUserSearchPageResponse>>(
    "/users/search",
    {
      params: {
        keyword: input.keyword,
        page: input.page ?? 0,
        size: input.size ?? 10,
      },
      signal: input.signal, // ✅ Truyền xuống axios
      skipGlobalErrorHandler: true,
    }
  )

  return response.data.data.items.map((item) => ({
    id: item.id,
    name: item.userName,
    email: item.email,
  }))
}
```

### Cấp độ 3: Service wrapper (optional)

```tsx
// services/project-service.ts
export const searchProjectOwners = async (input: {
  keyword: string
  page?: number
  size?: number
  signal?: AbortSignal
}): Promise<IProjectOwnerOption[]> => {
  return getProjectOwnerOptions(input)
}
```

### Cấp độ 4: Component dùng hook

```tsx
// components/AddProjectMemberModal.tsx
interface IAddProjectMemberModalProps {
  isOpen: boolean
  projectName: string
  isSubmitting: boolean
  fetchUsers: (keyword: string, signal?: AbortSignal) => Promise<IProjectOwnerOption[]>
  onClose: () => void
  onSubmit: (input: IAddProjectMemberRequest) => Promise<void>
}

export const AddProjectMemberModal = ({
  isOpen,
  projectName,
  isSubmitting,
  fetchUsers,
  onClose,
  onSubmit,
}: IAddProjectMemberModalProps) => {
  const [userKeyword, setUserKeyword] = useState("")
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [hasPrefetchedUsers, setHasPrefetchedUsers] = useState(false)
  const {
    isSearching: isSearchingUsers,
    results: users,
    search: searchUsers,
    searchImmediately,
    clearResults,
  } = useUserSearch(fetchUsers, 300, { allowEmptyKeyword: true })

  // ❌ KHÔNG reset state trong effect
  // ✅ Reset state trong explicit handler (close/submit)
  const resetForm = () => {
    setUserKeyword("")
    setIsUserDropdownOpen(false)
    setHasPrefetchedUsers(false)
    clearResults()
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetForm()
    onClose()
  }

  return (
    <>
      <input
        value={userKeyword}
        onChange={(event) => {
          const nextKeyword = event.target.value
          setUserKeyword(nextKeyword)
          void searchUsers(nextKeyword) // ✅ Debounce search khi gõ
          setIsUserDropdownOpen(true)
        }}
        onFocus={() => {
          setIsUserDropdownOpen(true)

          // ✅ Prefetch 1 lần khi chưa có data
          if (!hasPrefetchedUsers && users.length === 0) {
            setHasPrefetchedUsers(true)
            void searchImmediately("") // allowEmptyKeyword: true
          }
        }}
        placeholder="Nhập tên hoặc email"
      />

      {isUserDropdownOpen && (userKeyword.trim() || isSearchingUsers || hasPrefetchedUsers || users.length > 0) && (
        <div className="dropdown">
          {isSearchingUsers && <p>Đang tìm...</p>}
          {users.length === 0 && !isSearchingUsers && <p>Không có kết quả</p>}
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                setUserKeyword(user.name)
                setIsUserDropdownOpen(false)
              }}
            >
              {user.name}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
```

### Cấp độ 5: Parent page (fetch wrapper)

```tsx
// pages/TenantAdminPage.tsx
const fetchProjectMemberUsers = useCallback(
  async (keyword: string, signal?: AbortSignal): Promise<IProjectOwnerOption[]> => {
    const normalizedKeyword = keyword.trim()

    try {
      const users = await searchProjectOwners({
        keyword: normalizedKeyword,
        page: 0,
        size: 10,
        signal, // ✅ Truyền signal xuống
      })

      return users
    } catch {
      return []
    }
  },
  []
)

// Dùng trong JSX
<AddProjectMemberModal
  isOpen={isAddProjectMemberModalOpen}
  projectName={selectedProjectForMember?.name ?? ""}
  isSubmitting={isSubmittingProjectMember}
  fetchUsers={fetchProjectMemberUsers} // ✅ Truyền hàm fetch
  onClose={handleCloseAddProjectMemberModal}
  onSubmit={handleAddProjectMember}
/>
```

---

## 🔑 Quy tắc quan trọng

### 1. Dependency array của effect search
```tsx
// ✅ ĐÚNG
useEffect(() => {
  if (skipRef.current === debouncedKeyword) return
  executeSearch(debouncedKeyword)
}, [debouncedKeyword, executeSearch]) // ❌ KHÔNG include results
```

### 2. Xử lý early return
```tsx
// ✅ ĐÚNG - Xử lý isMounted để tránh memory leak
if (!controller.signal.aborted) {
  setResults(data)
}

// ❌ SAI - Không check signal
setResults(data) // Có thể ghi đè kết quả của request khác
```

### 3. Reset state khi close modal
```tsx
// ✅ ĐÚNG - Reset trong handler, không effect
const handleClose = () => {
  if (isSubmitting) return
  resetForm() // Clear state
  onClose()
}

// ❌ SAI - Reset trong effect
useEffect(() => {
  if (isOpen) return
  setKeyword("") // ❌ setState trong effect
}, [isOpen])
```

### 4. Prefetch vs Debounce search
```tsx
// ✅ ĐÚNG
// Focus → prefetch rỗng (1 lần)
onFocus={() => {
  if (!hasPrefetchedUsers && users.length === 0) {
    setHasPrefetchedUsers(true)
    void searchImmediately("")
  }
}}

// Gõ → debounce 300ms
onChange={() => {
  setKeyword(value)
  void searchUsers(value) // Debounce via hook
}}
```

---

## 📊 Flow chuẩn

```
User focus input
  ↓
onFocus trigger
  ↓
Kiểm tra: hasPrefetchedUsers && users.length === 0?
  ↓ (chưa prefetch)
searchImmediately("") → call API 1 lần ngay lập tức
  ↓ (done)
useEffect chỉ theo dbouncedKeyword, không theo results
  ↓
User gõ keyword
  ↓
onChange → setKeyword(value) + searchUsers(value)
  ↓
searchUsers gọi setKeyword (không gọi API ngay)
  ↓
Hook detect debouncedKeyword change (300ms sau)
  ↓
executeSearch(debouncedKeyword)
  ↓
Cancel request cũ + call API mới + AbortSignal check
  ↓
Kết quả update → re-render dropdown
  ↓
User click user
  ↓
Close dropdown + reset state trong handler
```

---

## 🛠️ Checklist khi implement

- [ ] Dùng custom hook với debounce + AbortController
- [ ] API layer nhận & truyền AbortSignal
- [ ] Không include results trong effect dependency
- [ ] Check `!controller.signal.aborted` trước setState
- [ ] Catch & ignore AbortError
- [ ] Reset state trong event handler, không effect
- [ ] Prefetch 1 lần khi focus (nếu cần)
- [ ] Debounce search khi gõ (default 300ms)
- [ ] Clear results khi close modal
- [ ] Cleanup AbortController on unmount

---

## 📚 Tham khảo

- React: https://react.dev/learn/synchronizing-with-effects
- AbortController: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
- useCallback: https://react.dev/reference/react/useCallback
