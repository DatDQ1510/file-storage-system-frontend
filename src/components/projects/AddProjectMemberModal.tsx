import { Loader2, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type { IUserTenantOption } from "@/lib/api/user-project-service"

export type TProjectPermissionCode = 1 | 2 | 4 | 8

export interface IProjectPermissionOption {
  code: TProjectPermissionCode
  name: string
  description: string
}

export const PROJECT_PERMISSION_OPTIONS: IProjectPermissionOption[] = [
  {
    code: 1,
    name: "READ",
    description: "Can view project resources",
  },
  {
    code: 2,
    name: "WRITE",
    description: "Can upload and modify project resources",
  },
  {
    code: 4,
    name: "DELETE",
    description: "Can remove project resources",
  },
  {
    code: 8,
    name: "MANAGE_MEMBER",
    description: "Can manage members and their permissions",
  },
]

export interface IAddProjectMemberSubmitInput {
  userId: string
  permission: number
}

interface IAddProjectMemberModalProps {
  isOpen: boolean
  isSubmitting: boolean
  isSearchingUsers: boolean
  userOptions: IUserTenantOption[]
  onSearchUsers: (keyword: string) => Promise<void>
  onClose: () => void
  onSubmit: (input: IAddProjectMemberSubmitInput) => Promise<void>
}

const toPermissionBitmask = (permissions: TProjectPermissionCode[]) => {
  return permissions.reduce((bitmask, permissionCode) => {
    return bitmask | permissionCode
  }, 0)
}

export const AddProjectMemberModal = ({
  isOpen,
  isSubmitting,
  isSearchingUsers,
  userOptions,
  onSearchUsers,
  onClose,
  onSubmit,
}: IAddProjectMemberModalProps) => {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [userKeyword, setUserKeyword] = useState("")
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<TProjectPermissionCode[]>([1])
  const [errorMessage, setErrorMessage] = useState("")
  const debouncedKeyword = useDebouncedValue(userKeyword, 600)

  const canSubmit = useMemo(() => {
    return Boolean(selectedUserId.trim() && selectedPermissionCodes.length > 0)
  }, [selectedPermissionCodes.length, selectedUserId])

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
    setSelectedUserId("")
    setUserKeyword("")
    setIsUserDropdownOpen(false)
    setIsUserTyping(false)
    setSelectedPermissionCodes([1])
    setErrorMessage("")
  }

  const handleClose = () => {
    if (isSubmitting) {
      return
    }

    resetForm()
    onClose()
  }

  const handleTogglePermission = (permissionCode: TProjectPermissionCode) => {
    setSelectedPermissionCodes((currentPermissions) => {
      const hasPermission = currentPermissions.includes(permissionCode)

      if (hasPermission) {
        return currentPermissions.filter((code) => code !== permissionCode)
      }

      return [...currentPermissions, permissionCode]
    })
  }

  const handleSubmit = async () => {
    if (!selectedUserId.trim()) {
      setErrorMessage("User is required.")
      return
    }

    if (selectedPermissionCodes.length === 0) {
      setErrorMessage("Select at least one permission.")
      return
    }

    setErrorMessage("")

    await onSubmit({
      userId: selectedUserId,
      permission: toPermissionBitmask(selectedPermissionCodes),
    })

    resetForm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={handleClose}
        aria-label="Close add project user modal"
      />

      <div className="relative z-10 flex h-[76vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {isSubmitting && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-700" />
              Adding user to project...
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-3xl font-semibold text-slate-900">Add user to project</h3>
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
            <label className="mb-1.5 block text-sm font-medium text-slate-800">User *</label>
            <div className="relative">
              <input
                value={userKeyword}
                onChange={(event) => {
                  const nextKeyword = event.target.value
                  setUserKeyword(nextKeyword)
                  setSelectedUserId("")
                  setIsUserTyping(true)
                  setIsUserDropdownOpen(true)
                }}
                onFocus={() => {
                  setIsUserTyping(true)
                  setIsUserDropdownOpen(true)
                  void onSearchUsers(userKeyword.trim())
                }}
                placeholder="Type user name or email"
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-800 outline-none focus:border-cyan-500"
              />

              {isSearchingUsers && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
              )}

              {isUserDropdownOpen && (userKeyword.trim() || isSearchingUsers || userOptions.length > 0) && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                  {isSearchingUsers ? (
                    <p className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching users...
                    </p>
                  ) : userOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-slate-500">No matching users.</p>
                  ) : (
                    userOptions.map((userOption) => (
                      <button
                        key={userOption.id}
                        type="button"
                        className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50"
                        onClick={() => {
                          setSelectedUserId(userOption.id)
                          setIsUserTyping(false)
                          setUserKeyword(
                            userOption.email
                              ? `${userOption.name} (${userOption.email})`
                              : userOption.name
                          )
                          setIsUserDropdownOpen(false)
                        }}
                      >
                        <span className="text-sm font-medium text-slate-800">{userOption.name}</span>
                        {userOption.email && (
                          <span className="text-xs text-slate-500">{userOption.email}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Permissions *</label>
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    <th className="px-3 py-2">Permission</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="w-24 px-3 py-2 text-center">Allow</th>
                  </tr>
                </thead>
                <tbody>
                  {PROJECT_PERMISSION_OPTIONS.map((permissionOption) => {
                    const isChecked = selectedPermissionCodes.includes(permissionOption.code)

                    return (
                      <tr key={permissionOption.code} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-3 py-3 font-semibold text-slate-800">{permissionOption.name}</td>
                        <td className="px-3 py-3 text-slate-600">{permissionOption.description}</td>
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(permissionOption.code)}
                            className="h-4 w-4 cursor-pointer accent-cyan-700"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-cyan-700 text-white hover:bg-cyan-800"
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
