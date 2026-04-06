import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Camera, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  changePassword,
  getCurrentUser,
  updateAvatar,
  updateProfile,
} from "@/lib/api/auth-service"
import type { IAuthUser } from "@/types/auth"

interface IAccountManagementSectionProps {
  initialUser?: IAuthUser
}

export const AccountManagementSection = ({ initialUser }: IAccountManagementSectionProps) => {
  const [fullName, setFullName] = useState(initialUser?.name ?? "Inter Admin")
  const [emailAddress, setEmailAddress] = useState(initialUser?.email ?? "admin@sovereign.arch")
  const [jobTitle, setJobTitle] = useState(initialUser?.jobTitle ?? "System Architect")
  const [department, setDepartment] = useState(initialUser?.department ?? "Infrastructure")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [avatarPreview, setAvatarPreview] = useState(initialUser?.avatar ?? "")
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUser = initialUser ?? (await getCurrentUser())

        setFullName(currentUser.name)
        setEmailAddress(currentUser.email)
        setJobTitle(currentUser.jobTitle ?? "System Architect")
        setDepartment(currentUser.department ?? "Infrastructure")
        setAvatarPreview(currentUser.avatar ?? "")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load account information")
      }
    }

    void loadCurrentUser()
  }, [initialUser])

  const initials = useMemo(() => {
    const sourceName = fullName.trim() || "Admin User"
    return sourceName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }, [fullName])

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingProfile(true)

    try {
      await updateProfile({
        name: fullName.trim(),
        email: emailAddress.trim(),
        jobTitle: jobTitle.trim(),
        department: department.trim(),
      })
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUpdateAvatar = async () => {
    if (!selectedAvatarFile) {
      toast.error("Please choose an avatar image first")
      return
    }

    setIsUpdatingAvatar(true)

    try {
      await updateAvatar(selectedAvatarFile)
      toast.success("Avatar updated successfully")
      setSelectedAvatarFile(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update avatar")
    } finally {
      setIsUpdatingAvatar(false)
    }
  }

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsChangingPassword(true)

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })
      toast.success("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200/80 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">Cập nhật thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]" onSubmit={handleSaveProfile}>
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
                  <input className="hidden" type="file" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-blue-700">Change Avatar</p>
                <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={handleUpdateAvatar} disabled={isUpdatingAvatar}>
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

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Full Name</span>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600" value={fullName} onChange={(event) => setFullName(event.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Email Address</span>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600" value={emailAddress} onChange={(event) => setEmailAddress(event.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Job Title</span>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Department</span>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600" value={department} onChange={(event) => setDepartment(event.target.value)} />
              </label>
              <div className="md:col-span-2 flex justify-end pt-2">
                <Button type="submit" className="bg-blue-700 text-white hover:bg-blue-800" disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving Changes
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200/80 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form className="grid max-w-2xl gap-4" onSubmit={handleChangePassword}>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Current Password</span>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">New Password</span>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Confirm New Password</span>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
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
        </CardContent>
      </Card>
    </div>
  )
}
