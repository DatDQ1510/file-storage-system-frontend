import { useCallback, useEffect, useRef, useState } from "react"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

export interface IUserSearchResult<T> {
  isSearching: boolean
  results: T[]
  search: (keyword: string) => Promise<void>
  searchImmediately: (keyword: string) => Promise<void>
  clearResults: () => void
}

interface IUserSearchOptions {
  allowEmptyKeyword?: boolean
}

/**
 * Hook for searching users with debouncing and request cancellation
 * Prevents race conditions by cancelling previous requests
 * Only calls API when keyword is not empty
 * @param fetchFn - Async function to fetch users (receives keyword)
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns { isSearching, results, search }
 */
export function useUserSearch<T>(
  fetchFn: (keyword: string, signal?: AbortSignal) => Promise<T[]>,
  debounceMs = 300,
  options: IUserSearchOptions = {}
): IUserSearchResult<T> {
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState<T[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedKeyword = useDebouncedValue(keyword, debounceMs)
  const controllerRef = useRef<AbortController | null>(null)
  const skipDebouncedKeywordRef = useRef<string | null>(null)
  const allowEmptyKeyword = options.allowEmptyKeyword ?? false

  const executeSearch = useCallback(
    async (searchKeyword: string) => {
      const trimmedKeyword = searchKeyword.trim()
      const normalizedKeyword = allowEmptyKeyword ? searchKeyword : trimmedKeyword

      if (!normalizedKeyword) {
        if (controllerRef.current) {
          controllerRef.current.abort()
        }
        setResults([])
        setIsSearching(false)
        return
      }

      if (controllerRef.current) {
        controllerRef.current.abort()
      }

      const controller = new AbortController()
      controllerRef.current = controller
      setIsSearching(true)

      try {
        const data = await fetchFn(normalizedKeyword, controller.signal)

        if (!controller.signal.aborted) {
          setResults(data)
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }

        console.error("User search error:", error)
        if (!controller.signal.aborted) {
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    },
    [allowEmptyKeyword, fetchFn]
  )

  // Execute search when debounced keyword changes and is not empty
  useEffect(() => {
    if (skipDebouncedKeywordRef.current === debouncedKeyword) {
      skipDebouncedKeywordRef.current = null
      return
    }

    void executeSearch(debouncedKeyword)
  }, [debouncedKeyword, executeSearch])

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

  return {
    isSearching,
    results,
    search,
    searchImmediately,
    clearResults,
  }
}
