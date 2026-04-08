import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  disableTwoFactor,
  setupTwoFactor,
  verifyTwoFactor,
} from "@/lib/api/two-fa-service"
import { getCurrentUser } from "@/lib/api/auth-service"
import type {
  ITwoFASetupResponse,
  ITwoFAStatusResponse,
  TTwoFAToggleAction,
} from "@/types/two-factor-auth"
import type { IAuthUser } from "@/types/auth"

const DEFAULT_TWO_FA_STATUS: ITwoFAStatusResponse = {
  enabled: false,
}

interface IUseTwoFactorAuthReturn {
  status: ITwoFAStatusResponse
  setupData: ITwoFASetupResponse | null
  verificationCode: string
  isLoadingStatus: boolean
  isSettingUp: boolean
  isVerifying: boolean
  isDisabling: boolean
  isTwoFactorEnabled: boolean
  isBusy: boolean
  qrCodeSrc: string
  manualEntryKey: string
  pendingAction: TTwoFAToggleAction | null
  setVerificationCode: (value: string) => void
  openToggleConfirmation: () => void
  closeToggleConfirmation: () => void
  confirmToggleAction: () => Promise<void>
  verifyEnableAction: () => Promise<void>
}

interface IUseTwoFactorAuthOptions {
  initialUser?: IAuthUser
  shouldFetchCurrentUser?: boolean
}

const mapTwoFactorStatusFromUser = (user?: IAuthUser): ITwoFAStatusResponse => {
  const hasSecretKey = user?.hasSecretKey === true
  const isTwoFactorEnabled = user?.twoFactorEnabled === true

  return {
    enabled: hasSecretKey || isTwoFactorEnabled,
  }
}

export const useTwoFactorAuth = (
  options: IUseTwoFactorAuthOptions = {}
): IUseTwoFactorAuthReturn => {
  const {
    initialUser,
    shouldFetchCurrentUser = true,
  } = options
  const [status, setStatus] = useState<ITwoFAStatusResponse>(DEFAULT_TWO_FA_STATUS)
  const [setupData, setSetupData] = useState<ITwoFASetupResponse | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)
  const [pendingAction, setPendingAction] = useState<TTwoFAToggleAction | null>(null)

  const isTwoFactorEnabled = status.enabled
  const isBusy = isSettingUp || isVerifying || isDisabling

  const qrCodeSrc = useMemo(() => {
    return setupData?.qrCodeDataUrl ?? setupData?.qrCodeUrl ?? status.qrCodeDataUrl ?? status.qrCodeUrl ?? ""
  }, [setupData, status.qrCodeDataUrl, status.qrCodeUrl])

  const manualEntryKey = useMemo(() => {
    return setupData?.manualEntryKey ?? setupData?.secret ?? status.manualEntryKey ?? status.secret ?? ""
  }, [setupData, status.manualEntryKey, status.secret])

  useEffect(() => {
    const loadStatus = async () => {
      try {
        if (initialUser) {
          setStatus(mapTwoFactorStatusFromUser(initialUser))
          return
        }

        if (!shouldFetchCurrentUser) {
          return
        }

        const currentUser = await getCurrentUser()
        setStatus(mapTwoFactorStatusFromUser(currentUser))
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load 2FA status")
      } finally {
        setIsLoadingStatus(false)
      }
    }

    void loadStatus()
  }, [initialUser, shouldFetchCurrentUser])

  const handleSetup = async () => {
    setIsSettingUp(true)

    try {
      const response = await setupTwoFactor()
      setSetupData(response)
      setVerificationCode("")
      toast.success("2FA setup started. Scan QR and verify code.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to setup 2FA")
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleDisable = async () => {
    setIsDisabling(true)

    try {
      await disableTwoFactor()
      setStatus((previous) => ({
        ...previous,
        enabled: false,
      }))
      setSetupData(null)
      setVerificationCode("")
      toast.success("Two-factor authentication disabled")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disable 2FA")
    } finally {
      setIsDisabling(false)
    }
  }

  const confirmToggleAction = async () => {
    if (!pendingAction) {
      return
    }

    if (pendingAction === "enable") {
      setPendingAction(null)
      await handleSetup()
      return
    }

    setPendingAction(null)
    await handleDisable()
  }

  const verifyEnableAction = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter authentication code")
      return
    }

    setIsVerifying(true)

    try {
      await verifyTwoFactor({
        code: verificationCode.trim(),
      })
      setStatus((previous) => ({
        ...previous,
        enabled: true,
      }))
      setSetupData(null)
      setVerificationCode("")
      toast.success("Two-factor authentication enabled")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify 2FA code")
    } finally {
      setIsVerifying(false)
    }
  }

  const openToggleConfirmation = () => {
    setPendingAction(isTwoFactorEnabled ? "disable" : "enable")
  }

  const closeToggleConfirmation = () => {
    setPendingAction(null)
  }

  return {
    status,
    setupData,
    verificationCode,
    isLoadingStatus,
    isSettingUp,
    isVerifying,
    isDisabling,
    isTwoFactorEnabled,
    isBusy,
    qrCodeSrc,
    manualEntryKey,
    pendingAction,
    setVerificationCode,
    openToggleConfirmation,
    closeToggleConfirmation,
    confirmToggleAction,
    verifyEnableAction,
  }
}
