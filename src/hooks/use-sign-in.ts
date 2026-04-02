import { useState } from "react"
import type { FormEvent } from "react"
import { signIn } from "@/lib/api/auth-service"
import type { ISignInInput } from "@/types/auth"

interface IUseSignInOptions {
  onSuccess?: () => void
}

interface IUseSignInReturn {
  usernameOrEmail: string
  password: string
  error: string | null
  isLoading: boolean
  setUsernameOrEmail: (value: string) => void
  setPassword: (value: string) => void
  resetForm: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

export const useSignIn = (options: IUseSignInOptions = {}): IUseSignInReturn => {
  const { onSuccess } = options
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setUsernameOrEmail("")
    setPassword("")
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!usernameOrEmail.trim() || !password.trim()) {
      setError("Please enter username/email and password")
      return
    }

    const input: ISignInInput = {
      usernameOrEmail: usernameOrEmail.trim(),
      password,
    }

    setIsLoading(true)

    try {
      const result = await signIn(input)
      onSuccess?.()
      console.log("Sign in successful:", result)
      resetForm()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Sign in failed"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    usernameOrEmail,
    password,
    error,
    isLoading,
    setUsernameOrEmail,
    setPassword,
    resetForm,
    handleSubmit,
  }
}
