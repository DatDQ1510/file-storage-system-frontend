import { useState } from "react"
import type { FormEvent } from "react"
import { signInWithTotp } from "@/lib/api/auth-service"
import type { ISignInWithTotpInput } from "@/types/auth"

interface IUseTotpSignInOptions {
  onSuccess?: () => void
}

interface IUseTotpSignInReturn {
  usernameOrEmail: string
  code: string
  error: string | null
  isLoading: boolean
  setUsernameOrEmail: (value: string) => void
  setCode: (value: string) => void
  resetForm: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

const CODE_PATTERN = /^\d{6}$/

export const useTotpSignIn = (
  options: IUseTotpSignInOptions = {}
): IUseTotpSignInReturn => {
  const { onSuccess } = options
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setUsernameOrEmail("")
    setCode("")
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!usernameOrEmail.trim()) {
      setError("Username or email is required")
      return
    }

    if (!CODE_PATTERN.test(code.trim())) {
      setError("TOTP code must be exactly 6 digits")
      return
    }

    const input: ISignInWithTotpInput = {
      usernameOrEmail: usernameOrEmail.trim(),
      code: code.trim(),
    }

    setIsLoading(true)

    try {
      const result = await signInWithTotp(input)
      onSuccess?.()
      console.log("TOTP sign in successful:", result)
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
    usernameOrEmail,
    code,
    error,
    isLoading,
    setUsernameOrEmail,
    setCode,
    resetForm,
    handleSubmit,
  }
}
