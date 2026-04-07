import type { FormEvent } from "react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IPasswordChangeFormProps {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  isChangingPassword: boolean
  onCurrentPasswordChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const PasswordChangeForm = ({
  currentPassword,
  newPassword,
  confirmPassword,
  isChangingPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: IPasswordChangeFormProps) => {
  return (
    <form className="grid max-w-2xl gap-4" onSubmit={onSubmit}>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Current Password</span>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
          type="password"
          value={currentPassword}
          onChange={(event) => onCurrentPasswordChange(event.target.value)}
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">New Password</span>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
          type="password"
          value={newPassword}
          onChange={(event) => onNewPasswordChange(event.target.value)}
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Confirm New Password</span>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
          type="password"
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
        />
      </label>
      <div className="pt-2">
        <Button type="submit" className="bg-blue-700 text-white hover:bg-blue-800" disabled={isChangingPassword}>
          {isChangingPassword ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Updating Password
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </div>
    </form>
  )
}