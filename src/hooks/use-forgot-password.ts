import { useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"
import {
  sendForgotPasswordCode,
  verifyForgotPasswordCode,
  resetPasswordWithCode,
} from "@/lib/api/auth-service"

type TForgotPasswordStep = 1 | 2 | 3

interface IUseForgotPasswordOptions {
  onCompleted?: () => void
}

interface IUseForgotPasswordReturn {
  step: TForgotPasswordStep
  email: string
  code: string
  newPassword: string
  confirmPassword: string
  isLoading: boolean
  error: string | null
  isCodeStep: boolean
  isResetStep: boolean
  setEmail: (value: string) => void
  setCode: (value: string) => void
  setNewPassword: (value: string) => void
  setConfirmPassword: (value: string) => void
  handleSendCode: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleVerifyCode: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleResetPassword: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleResendCode: () => Promise<void>
  handleBackStep: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_PATTERN = /^\d{6}$/

export const useForgotPassword = (
  options: IUseForgotPasswordOptions = {}
): IUseForgotPasswordReturn => {
  const { onCompleted } = options

  const [step, setStep] = useState<TForgotPasswordStep>(1)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateEmail = () => {
    if (!email.trim()) {
      return "Email is required"
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      return "Email is invalid"
    }

    return ""
  }

  const validateCode = () => {
    if (!code.trim()) {
      return "Code is required"
    }

    if (!CODE_PATTERN.test(code.trim())) {
      return "Code must be exactly 6 digits"
    }

    return ""
  }

  const validatePasswords = () => {
    if (!newPassword.trim()) {
      return "New password is required"
    }

    if (!confirmPassword.trim()) {
      return "Please confirm your new password"
    }

    if (newPassword !== confirmPassword) {
      return "Passwords do not match"
    }

    return ""
  }

  const handleSendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const emailError = validateEmail()
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)

    try {
      await sendForgotPasswordCode({ email: email.trim() })
      toast.success("Verification code sent to your email")
      setStep(2)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Cannot send verification code"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const emailError = validateEmail()
    if (emailError) {
      setError(emailError)
      return
    }

    const codeError = validateCode()
    if (codeError) {
      setError(codeError)
      return
    }

    setIsLoading(true)

    try {
      await verifyForgotPasswordCode({
        email: email.trim(),
        code: code.trim(),
      })
      toast.success("Code verified successfully")
      setStep(3)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Invalid or expired verification code"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const emailError = validateEmail()
    if (emailError) {
      setError(emailError)
      return
    }

    const codeError = validateCode()
    if (codeError) {
      setError(codeError)
      return
    }

    const passwordError = validatePasswords()
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)

    try {
      await resetPasswordWithCode({
        email: email.trim(),
        code: code.trim(),
        newPassword,
        confirmPassword,
      })
      toast.success("Password has been reset successfully")
      onCompleted?.()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Cannot reset password"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError(null)

    const emailError = validateEmail()
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)

    try {
      await sendForgotPasswordCode({ email: email.trim() })
      toast.success("A new verification code has been sent")
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Cannot resend verification code"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackStep = () => {
    setError(null)

    if (step === 3) {
      setStep(2)
      return
    }

    if (step === 2) {
      setStep(1)
    }
  }

  return {
    step,
    email,
    code,
    newPassword,
    confirmPassword,
    isLoading,
    error,
    isCodeStep: step === 2,
    isResetStep: step === 3,
    setEmail,
    setCode,
    setNewPassword,
    setConfirmPassword,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    handleBackStep,
  }
}
