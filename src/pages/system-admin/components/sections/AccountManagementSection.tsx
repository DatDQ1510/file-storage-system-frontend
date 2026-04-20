import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  changePassword,
  getCurrentUser,
  updateAvatar,
  updateProfile,
} from "@/lib/api/auth-service"
import { PasswordChangeForm } from "@/pages/system-admin/components/sections/account-management/PasswordChangeForm"
import type { IUpdatePasswordInput } from "@/types/auth"
import { ProfileAvatarUploader } from "@/pages/system-admin/components/sections/account-management/ProfileAvatarUploader"
import { ProfileDetailsForm } from "@/pages/system-admin/components/sections/account-management/ProfileDetailsForm"
import { TwoFactorAuthenticationSection } from "@/pages/system-admin/components/sections/TwoFactorAuthenticationSection"
import type { IAuthUser } from "@/types/auth"

interface IAccountManagementSectionProps {
  initialUser?: IAuthUser
}

export const AccountManagementSection = ({ initialUser }: IAccountManagementSectionProps) => {
  const [currentUser, setCurrentUser] = useState<IAuthUser | undefined>(initialUser)
  const [username, setUsername] = useState(initialUser?.username ?? "Quản trị viên")
  const [emailAddress, setEmailAddress] = useState(initialUser?.email ?? "admin@sovereign.arch")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(initialUser?.avatar ?? "")
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const fetchedCurrentUser = initialUser ?? (await getCurrentUser())

        setCurrentUser(fetchedCurrentUser)
        setUsername(fetchedCurrentUser.username)
        setEmailAddress(fetchedCurrentUser.email)
        setAvatarPreview(fetchedCurrentUser.avatar ?? "")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể tải thông tin tài khoản")
      }
    }

    void loadCurrentUser()
  }, [initialUser])

  const initials = useMemo(() => {
    const sourceName = username.trim() || "Quản trị viên"
    return sourceName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }, [username])

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
        username: username.trim(),
        email: emailAddress.trim(),
      })
      toast.success("Cập nhật hồ sơ thành công")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật hồ sơ")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUpdateAvatar = async () => {
    if (!selectedAvatarFile) {
      toast.error("Vui lòng chọn ảnh đại diện trước")
      return
    }

    setIsUpdatingAvatar(true)

    try {
      await updateAvatar(selectedAvatarFile)
      toast.success("Cập nhật ảnh đại diện thành công")
      setSelectedAvatarFile(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật ảnh đại diện")
    } finally {
      setIsUpdatingAvatar(false)
    }
  }

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsChangingPassword(true)

    try {
      const passwordInput: IUpdatePasswordInput = {
        currentPassword,
        newPassword,
        confirmPassword,
      }

      await changePassword(passwordInput)
      toast.success("Cập nhật mật khẩu thành công")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật mật khẩu")
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200/80 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">Cập nhật thông tin cá nhân</CardTitle>
          <p className="text-sm text-slate-600">
            Cập nhật hồ sơ quản trị viên và ảnh đại diện sử dụng trong toàn bộ trang quản trị hệ thống.
          </p>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
            <ProfileAvatarUploader
              avatarPreview={avatarPreview}
              initials={initials}
              hasPendingAvatar={Boolean(selectedAvatarFile)}
              isUpdatingAvatar={isUpdatingAvatar}
              onAvatarChange={handleAvatarChange}
              onUpdateAvatar={handleUpdateAvatar}
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:p-5">
              <ProfileDetailsForm
                username={username}
                emailAddress={emailAddress}
                isSavingProfile={isSavingProfile}
                onUsernameChange={setUsername}
                onEmailAddressChange={setEmailAddress}
                onSubmit={handleSaveProfile}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Đổi mật khẩu</CardTitle>
            <p className="text-sm text-slate-600">Sử dụng mật khẩu mạnh để tăng cường bảo mật tài khoản quản trị.</p>
          </CardHeader>
          <CardContent className="p-4 md:p-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <PasswordChangeForm
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                isChangingPassword={isChangingPassword}
                onCurrentPasswordChange={setCurrentPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onSubmit={handleChangePassword}
                isNewPasswordVisible={isNewPasswordVisible}
                setIsNewPasswordVisible={setIsNewPasswordVisible}
                isConfirmPasswordVisible={isConfirmPasswordVisible}
                setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
              />
            </div>
          </CardContent>
        </Card>

        <TwoFactorAuthenticationSection
          initialUser={currentUser}
          shouldFetchCurrentUser={false}
        />
      </div>
    </div>
  )
}
