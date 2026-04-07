import type { ChangeEvent } from "react"
import { Camera, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IProfileAvatarUploaderProps {
  avatarPreview: string
  initials: string
  isUpdatingAvatar: boolean
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void
  onUpdateAvatar: () => void
}

export const ProfileAvatarUploader = ({
  avatarPreview,
  initials,
  isUpdatingAvatar,
  onAvatarChange,
  onUpdateAvatar,
}: IProfileAvatarUploaderProps) => {
  return (
    <div className="flex flex-col items-center gap-3 xl:pt-2">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-2xl font-bold text-slate-700 ring-4 ring-white shadow-sm">
          {avatarPreview ? (
            <img alt="Avatar preview" className="h-full w-full object-cover" src={avatarPreview} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <label className="absolute -bottom-1 -right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md">
          <Camera className="h-4 w-4" />
          <input className="hidden" type="file" accept="image/*" onChange={onAvatarChange} />
        </label>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-blue-700">Change Avatar</p>
        <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={onUpdateAvatar} disabled={isUpdatingAvatar}>
        {isUpdatingAvatar ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Updating Avatar
          </>
        ) : (
          "Upload Avatar"
        )}
      </Button>
    </div>
  )
}