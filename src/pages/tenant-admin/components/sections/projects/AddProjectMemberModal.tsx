import { Loader2, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type {
  IAddProjectMemberRequest,
  IProjectOwnerOption,
} from "@/pages/tenant-admin/types"

interface IAddProjectMemberModalProps {
  isOpen: boolean
  projectName: string
  isSubmitting: boolean
  isSearchingUsers: boolean
  users: IProjectOwnerOption[]
  onSearchUsers: (keyword: string) => Promise<void>
  onClose: () => void
  onSubmit: (input: IAddProjectMemberRequest) => Promise<void>
}

const PERMISSION_OPTIONS = [
  {
    label: "Read",
    value: 1,
    description: "View files and folders in project",
  },
  {
    label: "Write",
    value: 2,
    description: "Upload, edit and move files",
  },
  {
    label: "Delete",
    value: 4,
    description: "Delete project resources",
  },
  {
    label: "Manage member",
    value: 8,
    description: "Add or update project members",
  },
] as const

const DEFAULT_PERMISSION = 1

const INITIAL_FORM_STATE: IAddProjectMemberRequest = {
  userId: "",
  permission: DEFAULT_PERMISSION,
}

export const AddProjectMemberModal = ({
  isOpen,
  projectName,
  isSubmitting,
  isSearchingUsers,
  users,
  onSearchUsers,
  onClose,
  onSubmit,
}: IAddProjectMemberModalProps) => {
  const [formState, setFormState] = useState<IAddProjectMemberRequest>(INITIAL_FORM_STATE)
  const [userKeyword, setUserKeyword] = useState("")
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const debouncedKeyword = useDebouncedValue(userKeyword, 800)

  const selectedPermissionSet = useMemo(() => {
    const set = new Set<number>()

    PERMISSION_OPTIONS.forEach((permissionOption) => {
      if ((formState.permission & permissionOption.value) === permissionOption.value) {
        set.add(permissionOption.value)
      }
    })

    return set
  }, [formState.permission])

  const canSubmit = useMemo(() => {
    return Boolean(formState.userId.trim() && formState.permission > 0)
  }, [formState.permission, formState.userId])

  useEffect(() => {
    if (!isOpen || !isUserTyping) {
      return
    }

    void onSearchUsers(debouncedKeyword.trim())
  }, [debouncedKeyword, isOpen, isUserTyping, onSearchUsers])

  if (!isOpen) {
    return null
  }

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE)
    setUserKeyword("")
    setIsUserTyping(false)
    setIsUserDropdownOpen(false)
    setErrorMessage("")
  }

  const handleClose = () => {
    if (isSubmitting) {
      return
    }

    resetForm()
    onClose()
  }

  const handleTogglePermission = (permissionValue: number) => {
    setFormState((current) => {
      const hasPermission = (current.permission & permissionValue) === permissionValue
      const nextPermission = hasPermission
        ? current.permission & ~permissionValue
        : current.permission | permissionValue

      return {
        ...current,
        permission: nextPermission,
      }
    })
  }

  const handleSubmit = async () => {
    const normalizedInput: IAddProjectMemberRequest = {
      userId: formState.userId.trim(),
      permission: formState.permission,
    }

    if (!normalizedInput.userId) {
      setErrorMessage("Người dùng là bắt buộc.")
      return
    }

    if (!Number.isFinite(normalizedInput.permission) || normalizedInput.permission <= 0) {
      setErrorMessage("Cần chọn ít nhất một quyền.")
      return
    }

    setErrorMessage("")
    await onSubmit(normalizedInput)
    resetForm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={handleClose}
        aria-label="Close add project member modal"
      />

      <div className="relative z-10 flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {isSubmitting && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-700" />
              Đang thêm thành viên...
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-3xl font-semibold text-slate-900">Add user in project</h3>
            <p className="mt-1 text-sm text-slate-500">Dự án: {projectName || "-"}</p>
          </div>

          <button
            type="button"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Người dùng *</label>
            <div className="relative">
              <input
                value={userKeyword}
                onChange={(event) => {
                  const nextKeyword = event.target.value
                  setUserKeyword(nextKeyword)
                  setFormState((current) => ({
                    ...current,
                    userId: "",
                  }))
                  setIsUserTyping(true)
                  setIsUserDropdownOpen(true)
                }}
                onFocus={() => {
                  setIsUserTyping(true)
                  setIsUserDropdownOpen(true)
                  void onSearchUsers(userKeyword.trim())
                }}
                placeholder="Nhập tên hoặc email người dùng"
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-800 outline-none focus:border-cyan-500"
              />

              {isSearchingUsers && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
              )}

              {isSearchingUsers && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-700">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang tải danh sách người dùng...
                </p>
              )}

              {isUserDropdownOpen && (userKeyword.trim() || isSearchingUsers || users.length > 0) && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                  {isSearchingUsers ? (
                    <p className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tìm người dùng...
                    </p>
                  ) : users.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-slate-500">Không có kết quả phù hợp.</p>
                  ) : (
                    users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50"
                        onClick={() => {
                          setFormState((current) => ({
                            ...current,
                            userId: user.id,
                          }))
                          setIsUserTyping(false)
                          setIsUserDropdownOpen(false)
                          setUserKeyword(user.email ? `${user.name} (${user.email})` : user.name)
                        }}
                      >
                        <span className="text-sm font-medium text-slate-800">{user.name}</span>
                        {user.email && (
                          <span className="text-xs text-slate-500">{user.email}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">Quyền truy cập *</label>
            <div className="space-y-2">
              {PERMISSION_OPTIONS.map((permissionOption) => {
                const isChecked = selectedPermissionSet.has(permissionOption.value)

                return (
                  <label
                    key={permissionOption.value}
                    className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(permissionOption.value)}
                      className="mt-1 h-4 w-4 accent-cyan-700"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-800">
                        {permissionOption.label} ({permissionOption.value})
                      </span>
                      <span className="text-xs text-slate-500">{permissionOption.description}</span>
                    </span>
                  </label>
                )
              })}
            </div>
            <p className="mt-1 text-xs text-slate-500">Permission bitmask hiện tại: {formState.permission}</p>
          </div>

          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="button"
            className="bg-cyan-700 text-white hover:bg-cyan-800"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang thêm...
              </>
            ) : (
              "Thêm thành viên"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
