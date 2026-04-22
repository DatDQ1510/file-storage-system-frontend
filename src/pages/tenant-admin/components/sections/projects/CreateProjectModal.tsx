import { Loader2, X } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useUserSearch } from "@/hooks/use-user-search"
import type {
  IProjectOwnerOption,
  IProjectRequest,
} from "@/pages/tenant-admin/types"

interface ICreateProjectModalProps {
  isOpen: boolean
  isSubmitting: boolean
  fetchOwners: (keyword: string) => Promise<IProjectOwnerOption[]>
  onClose: () => void
  onSubmit: (input: IProjectRequest) => Promise<void>
}

const INITIAL_PROJECT_FORM_STATE: IProjectRequest = {
  nameProject: "",
  ownerId: "",
}

export const CreateProjectModal = ({
  isOpen,
  isSubmitting,
  fetchOwners,
  onClose,
  onSubmit,
}: ICreateProjectModalProps) => {
  const [formState, setFormState] = useState<IProjectRequest>(INITIAL_PROJECT_FORM_STATE)
  const [ownerKeyword, setOwnerKeyword] = useState("")
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Use custom hook for owner search with debouncing and abort controller
  const { isSearching: isSearchingOwners, results: owners, search: searchOwners } = useUserSearch(fetchOwners, 300)

  const canSubmit = useMemo(() => {
    return Boolean(
      formState.nameProject.trim() &&
        formState.nameProject.trim().length <= 255 &&
        formState.ownerId.trim()
    )
  }, [formState])

  if (!isOpen) {
    return null
  }

  const handleClose = () => {
    if (isSubmitting) {
      return
    }

    setErrorMessage("")
    setIsOwnerDropdownOpen(false)
    setOwnerKeyword("")
    searchOwners("") // Reset search
    onClose()
  }

  const handleSubmit = async () => {
    const normalizedInput: IProjectRequest = {
      nameProject: formState.nameProject.trim(),
      ownerId: formState.ownerId.trim(),
    }

    if (!normalizedInput.nameProject) {
      setErrorMessage("Tên dự án là bắt buộc.")
      return
    }

    if (normalizedInput.nameProject.length > 255) {
      setErrorMessage("Tên dự án tối đa 255 ký tự.")
      return
    }

    if (!normalizedInput.ownerId) {
      setErrorMessage("Chủ sở hữu là bắt buộc.")
      return
    }

    setErrorMessage("")
    await onSubmit(normalizedInput)
    setFormState(INITIAL_PROJECT_FORM_STATE)
    setOwnerKeyword("")
    setIsOwnerDropdownOpen(false)
    searchOwners("") // Reset search
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={handleClose}
        aria-label="Đóng hộp thoại tạo dự án"
      />

      <div className="relative z-10 flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {isSubmitting && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-700" />
              Đang tạo dự án...
            </div>
          </div>
        )}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-3xl font-semibold text-slate-900">Tạo dự án mới</h3>
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
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Tên dự án *</label>
            <input
              value={formState.nameProject}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  nameProject: event.target.value,
                }))
              }
              placeholder="Nhập tên dự án"
              maxLength={255}
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-cyan-500"
            />
            <p className="mt-1 text-xs text-slate-500">Tối đa 255 ký tự</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Chủ sở hữu *</label>
            <div className="relative">
              <input
                value={ownerKeyword}
                onChange={(event) => {
                  const nextKeyword = event.target.value
                  setOwnerKeyword(nextKeyword)
                  searchOwners(nextKeyword)
                  setFormState((current) => ({
                    ...current,
                    ownerId: "",
                  }))
                  setIsOwnerDropdownOpen(true)
                }}
                onFocus={() => {
                  setIsOwnerDropdownOpen(true)
                  // Load initial owners when field is focused
                  searchOwners("")
                }}
                placeholder="Nhập tên hoặc email chủ sở hữu"
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-800 outline-none focus:border-cyan-500"
              />

              {isSearchingOwners && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
              )}

              {isSearchingOwners && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-700">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang tải danh sách chủ sở hữu...
                </p>
              )}

               {isOwnerDropdownOpen && (ownerKeyword.trim() || isSearchingOwners || owners.length > 0) && (
                 <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                  {isSearchingOwners ? (
                    <p className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tìm chủ sở hữu...
                    </p>
                  ) : owners.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-slate-500">Không có kết quả phù hợp.</p>
                  ) : (
                    owners.map((owner) => (
                      <button
                        key={owner.id}
                        type="button"
                        className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50"
                         onClick={() => {
                           setFormState((current) => ({
                             ...current,
                             ownerId: owner.id,
                           }))
                           setOwnerKeyword(owner.email ? `${owner.name} (${owner.email})` : owner.name)
                           setIsOwnerDropdownOpen(false)
                           searchOwners("") // Clear search
                         }}
                      >
                        <span className="text-sm font-medium text-slate-800">{owner.name}</span>
                        {owner.email && (
                          <span className="text-xs text-slate-500">{owner.email}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
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
                Đang tạo...
              </>
            ) : (
              "Tạo dự án"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
