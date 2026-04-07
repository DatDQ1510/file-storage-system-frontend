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
  const [username, setUsername] = useState(initialUser?.username ?? "Inter Admin")
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
        const currentUser = initialUser ?? (await getCurrentUser())

        setUsername(currentUser.username)
        setEmailAddress(currentUser.email)
        setAvatarPreview(currentUser.avatar ?? "")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load account information")
      }
    }

    void loadCurrentUser()
  }, [initialUser])

  const initials = useMemo(() => {
    const sourceName = username.trim() || "Admin User"
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
          <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
            <ProfileAvatarUploader
              avatarPreview={avatarPreview}
              initials={initials}
              isUpdatingAvatar={isUpdatingAvatar}
              onAvatarChange={handleAvatarChange}
              onUpdateAvatar={handleUpdateAvatar}
            />

            <ProfileDetailsForm
              username={username}
              emailAddress={emailAddress}
              isSavingProfile={isSavingProfile}
              onUsernameChange={setUsername}
              onEmailAddressChange={setEmailAddress}
              onSubmit={handleSaveProfile}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Đổi mật khẩu</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <TwoFactorAuthenticationSection />
      </div>
    </div>
  )
}
