import { useState } from "react"
import type { FormEvent } from "react"
import { getStoredEmail, signInWithTotp } from "@/lib/api/auth-service"
import type { ISignInWithTotpInput } from "@/types/auth"

interface IUseTotpSignInOptions {
  onSuccess?: () => void
}

interface IUseTotpSignInReturn {
  email: string
  code: string
  error: string | null
  isLoading: boolean
  setEmail: (value: string) => void
  setCode: (value: string) => void
  resetForm: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

const CODE_PATTERN = /^\d{6}$/
const PENDING_TOTP_EMAIL_KEY = "pendingTotpEmail"

export const useTotpSignIn = (
  options: IUseTotpSignInOptions = {}
): IUseTotpSignInReturn => {
  const { onSuccess } = options
  const defaultIdentifier =
    typeof window !== "undefined"
      ? sessionStorage.getItem(PENDING_TOTP_EMAIL_KEY)
        ?? sessionStorage.getItem("pendingTotpIdentifier")
        ?? getStoredEmail()
      : ""

  const [email, setEmail] = useState(defaultIdentifier)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setCode("")
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!CODE_PATTERN.test(code.trim())) {
      setError("TOTP code must be exactly 6 digits")
      return
    }

    if (!email.trim()) {
      setError("Email or username is required")
      return
    }

    const input: ISignInWithTotpInput = {
      code: code.trim(),
      email: email.trim(),
    }

    setIsLoading(true)

    try {
      await signInWithTotp(input)
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(PENDING_TOTP_EMAIL_KEY)
        sessionStorage.removeItem("pendingTotpIdentifier")
      }
      onSuccess?.()
      resetForm()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "TOTP sign in failed"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    code,
    error,
    isLoading,
    setEmail,
    setCode,
    resetForm,
    handleSubmit,
  }
}
