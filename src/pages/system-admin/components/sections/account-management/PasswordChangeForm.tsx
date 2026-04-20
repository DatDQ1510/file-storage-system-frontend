import type { Dispatch, FormEvent, SetStateAction } from "react"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
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
  isNewPasswordVisible: boolean
  setIsNewPasswordVisible: Dispatch<SetStateAction<boolean>>
  isConfirmPasswordVisible: boolean
  setIsConfirmPasswordVisible: Dispatch<SetStateAction<boolean>>
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
  isNewPasswordVisible,
  setIsNewPasswordVisible,
  isConfirmPasswordVisible,
  setIsConfirmPasswordVisible,
}: IPasswordChangeFormProps) => {
  return (
    <form className="grid max-w-2xl gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <label className="space-y-2 md:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Mật khẩu hiện tại</span>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          id="system-admin-current-password"
          placeholder="Nhập mật khẩu hiện tại"
          type="password"
          value={currentPassword}
          onChange={(event) => onCurrentPasswordChange(event.target.value)}
        />
      </label>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Mật khẩu mới</span>
        <div className="relative">
          <input
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="system-admin-new-password"
            placeholder="Tối thiểu 8 ký tự"
            type={isNewPasswordVisible ? "text" : "password"}
            value={newPassword}
            onChange={(event) => onNewPasswordChange(event.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 text-slate-500"
            onClick={() => setIsNewPasswordVisible((previous) => !previous)}
          >
            {isNewPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </label>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Xác nhận mật khẩu mới</span>
        <div className="relative">
          <input
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="system-admin-confirm-password"
            placeholder="Nhập lại mật khẩu mới"
            type={isConfirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 text-slate-500"
            onClick={() => setIsConfirmPasswordVisible((previous) => !previous)}
          >
            {isConfirmPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </label>
      <div className="flex justify-end pt-1 md:col-span-2">
        <Button type="submit" className="h-9 bg-blue-700 text-white hover:bg-blue-800" disabled={isChangingPassword}>
          {isChangingPassword ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Đang cập nhật mật khẩu
            </>
          ) : (
            "Cập nhật mật khẩu"
          )}
        </Button>
      </div>
    </form>
  )
}
