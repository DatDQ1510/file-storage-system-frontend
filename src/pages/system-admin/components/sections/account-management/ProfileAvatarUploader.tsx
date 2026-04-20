import type { ChangeEvent } from "react"
import { Camera, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IProfileAvatarUploaderProps {
  avatarPreview: string
  initials: string
  hasPendingAvatar: boolean
  isUpdatingAvatar: boolean
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void
  onUpdateAvatar: () => void
}

export const ProfileAvatarUploader = ({
  avatarPreview,
  initials,
  hasPendingAvatar,
  isUpdatingAvatar,
  onAvatarChange,
  onUpdateAvatar,
}: IProfileAvatarUploaderProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
      <div className="mb-4 space-y-1">
        <p className="text-sm font-semibold text-slate-900">Ảnh đại diện</p>
        <p className="text-xs text-slate-500">PNG, JPG, WEBP tối đa 5MB.</p>
      </div>

      <div className="flex flex-col items-center gap-3">
      <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-2xl font-bold text-slate-700 ring-4 ring-white shadow-sm">
          {avatarPreview ? (
            <img alt="Xem trước ảnh đại diện" className="h-full w-full object-cover" src={avatarPreview} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
          <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-blue-300 hover:text-blue-700">
            <Camera className="h-4 w-4" />
            <input className="hidden" type="file" accept="image/*" onChange={onAvatarChange} />
          </label>
        </div>
        <p className="text-xs font-medium text-slate-600">Nhấn biểu tượng camera để chọn ảnh mới</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4 h-9 w-full"
        onClick={onUpdateAvatar}
        disabled={isUpdatingAvatar || !hasPendingAvatar}
      >
        {isUpdatingAvatar ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Đang cập nhật ảnh
          </>
        ) : (
          "Áp dụng ảnh đại diện"
        )}
      </Button>
    </div>
  )
}
