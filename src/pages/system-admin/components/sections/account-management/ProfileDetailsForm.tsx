import type { FormEvent } from "react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IProfileDetailsFormProps {
  username: string
  emailAddress: string
  isSavingProfile: boolean
  onUsernameChange: (value: string) => void
  onEmailAddressChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const ProfileDetailsForm = ({
  username,
  emailAddress,
  isSavingProfile,
  onUsernameChange,
  onEmailAddressChange,
  onSubmit,
}: IProfileDetailsFormProps) => {
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Tên đăng nhập</span>
        <input
          id="system-admin-username"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          placeholder="Nhập tên đăng nhập"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
        />
      </label>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Địa chỉ email</span>
        <input
          id="system-admin-email"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          placeholder="admin@company.com"
          type="email"
          value={emailAddress}
          onChange={(event) => onEmailAddressChange(event.target.value)}
        />
      </label>

      <div className="flex justify-end pt-1 md:col-span-2">
        <Button type="submit" className="h-9 bg-blue-700 text-white hover:bg-blue-800" disabled={isSavingProfile}>
          {isSavingProfile ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Đang lưu hồ sơ
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </div>
    </form>
  )
}
