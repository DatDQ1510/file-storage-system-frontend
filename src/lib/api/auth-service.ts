/**
 * Authentication Service
 * Handles API calls for login, signup, and token management
 * 
 * Pattern:
 * - Typed requests with ISignInInput, ISignUpInput
 * - Typed responses with IAuthResponse
 * - Token storage in localStorage
 * - Error handling via global interceptor
 */

import { api } from "@/lib/api/axios-client"
import type {
  ISignInInput,
  ISignUpInput,
  IAuthResponse,
  IAuthUser,
  ISignInResponse,
  ISignUpResponse,
  IAuthTokenResponse,
  IForgotPasswordSendCodeInput,
  IForgotPasswordVerifyCodeInput,
  IForgotPasswordResetRequest,
  IForgotPasswordResetPasswordInput,
  IApiResponse,
  ISignInWithTotpInput,
  ISignInResult,
  IUpdatePasswordInput,
} from "@/types/auth"

const TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const AUTH_DATA_KEY = "authData"
const EMAIL_KEY = "email"

/**
 * Store tokens in localStorage
 * @param token Access token
 * @param refreshToken Optional refresh token for token renewal
 */
const storeTokens = (token: string, refreshToken?: string) => {
  localStorage.setItem(TOKEN_KEY, token)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

const storeAuthData = (authData: IAuthTokenResponse) => {
  localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(authData))
  localStorage.setItem("role", authData.role)
  localStorage.setItem(EMAIL_KEY, authData.email)
}

const storeEmail = (email?: string) => {
  if (!email) {
    return
  }

  localStorage.setItem(EMAIL_KEY, email)
}

export const getStoredEmail = (): string => {
  if (typeof window === "undefined") {
    return ""
  }

  return localStorage.getItem(EMAIL_KEY) ?? ""
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const extractSignInPayload = (rawResponse: unknown): Record<string, unknown> => {
  if (!isRecord(rawResponse)) {
    return {}
  }

  const nestedData = rawResponse.data

  if (isRecord(nestedData)) {
    return nestedData
  }

  return rawResponse
}

const toBoolean = (value: unknown): boolean => {
  return value === true
}

const toStringValue = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim() ? value : undefined
}

const normalizeSignInResult = (
  rawResponse: unknown,
  usernameOrEmailInput: string
): ISignInResult => {
  const payload = extractSignInPayload(rawResponse)

  const accessToken = toStringValue(payload.accessToken)
  const requiresTwoFactor =
    toBoolean(payload.requiresTwoFactor) ||
    toBoolean(payload.twoFactorRequired) ||
    toBoolean(payload.requireTwoFactor)

  const payloadUser = isRecord(payload.user) ? payload.user : undefined
  const payloadEmail =
    toStringValue(payload.email) ?? toStringValue(payloadUser?.email)
  const normalizedEmail = payloadEmail ?? usernameOrEmailInput

  return {
    ...(payload as Partial<IAuthTokenResponse>),
    accessToken,
    email: normalizedEmail,
    requiresTwoFactor,
    pendingUsernameOrEmail:
      toStringValue(payload.pendingUsernameOrEmail) ??
      normalizedEmail,
  }
}

/**
 * Get stored access token
 */
export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get stored refresh token
 */
export const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Get stored auth payload
 */
export const getStoredAuthData = (): IAuthTokenResponse | null => {
  if (typeof window === "undefined") return null

  const authData = localStorage.getItem(AUTH_DATA_KEY)

  if (!authData) {
    return null
  }

  try {
    return JSON.parse(authData) as IAuthTokenResponse
  } catch {
    return null
  }
}

/**
 * Clear tokens from localStorage
 */
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_DATA_KEY)
  localStorage.removeItem("role")
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem("tokenExpiry")
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getStoredToken()
}

/**
 * POST - Sign in with email and password
 * @param input Email and password
 * @returns User data and tokens
 */
export const signIn = async (
  input: ISignInInput
): Promise<ISignInResult> => {
  const request: ISignInInput = {
    usernameOrEmail: input.usernameOrEmail,
    password: input.password,
  }

  const response = await api.post<IApiResponse<unknown>>(
    "/auth/login",
    request,
    {
      withCredentials: true,
    }
  )

  const normalizedResult = normalizeSignInResult(
    response.data,
    input.usernameOrEmail.trim()
  )

  const { accessToken, requiresTwoFactor } = normalizedResult

  storeEmail(normalizedResult.email)

  if (!requiresTwoFactor && accessToken) {
    // Store tokens in localStorage when login is fully completed.
    storeTokens(accessToken)
    storeAuthData(normalizedResult as IAuthTokenResponse)
  }

  return normalizedResult
}

/**
 * POST - Sign in with TOTP code from authenticator app
 */
export const signInWithTotp = async (
  input: ISignInWithTotpInput
): Promise<IAuthTokenResponse> => {
  const request: Partial<ISignInWithTotpInput> = {
    code: input.code,
  }

  if (input.email?.trim()) {
    request.email = input.email.trim()
  }

  const response = await api.post<ISignInResponse>(
    "/2fa/verify",
    request,
    {
      withCredentials: true,
    }
  )

  const { accessToken } = response.data.data

  storeTokens(accessToken)
  storeAuthData(response.data.data)

  return response.data.data
}

/**
 * POST - Sign up with email and password
 * @param input User details
 * @returns User data and tokens
 */
export const signUp = async (input: ISignUpInput): Promise<IAuthResponse> => {
  // Validate passwords match
  if (input.password !== input.confirmPassword) {
    throw new Error("Passwords do not match")
  }

  const request: ISignUpInput = {
    name: input.name,
    usernameOrEmail: input.usernameOrEmail,
    password: input.password,
    confirmPassword: input.confirmPassword,
  }

  const response = await api.post<ISignUpResponse>("/auth/sign-up", {
    name: request.name,
    usernameOrEmail: request.usernameOrEmail,
    password: request.password,
  })

  const { token, refreshToken } = response.data.data

  // Store tokens in localStorage
  storeTokens(token, refreshToken)
  storeEmail(response.data.data.user.email)

  return response.data.data
}

/**
 * POST - Sign out
 * Clears tokens and calls backend to invalidate
 */
export const signOut = async (): Promise<void> => {
  try {
    const request = {}

    // Call backend to invalidate token (optional)
    await api.post(
      "/auth/sign-out",
      request,
      {
        withCredentials: true,
      }
    )
  } catch (error) {
    // Even if logout fails on backend, still clear local tokens
    console.error("Sign out error:", error)
  } finally {
    // Always clear local tokens
    clearTokens()
  }
}

/**
 * POST - Refresh access token
 * Called when token is about to expire
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getStoredRefreshToken()

  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  try {
    const request = {
      refreshToken,
    }

    const response = await api.post<{ token: string }>(
      "/auth/refresh-token",
      request
    )

    const newToken = response.data.token
    localStorage.setItem(TOKEN_KEY, newToken)

    return newToken
  } catch (error) {
    // If refresh fails, clear tokens and redirect to login
    clearTokens()
    throw error
  }
}

/**
 * GET - Get current user data
 * @param userId Optional id of the user to load; if omitted, uses stored auth userId
 * @returns Current authenticated user
 */
export const getCurrentUser = async (userId?: string): Promise<IAuthUser> => {
  const storedUserId = userId?.trim() || getStoredAuthData()?.userId

  if (!storedUserId) {
    throw new Error("User ID is required to fetch current user data")
  }

  const response = await api.get<IApiResponse<IAuthUser>>(`/auth/me/${storedUserId}`)
  return response.data.data
}

/**
 * PUT - Update user profile
 */
export const updateProfile = async (
  data: Partial<IAuthUser>
): Promise<IAuthUser> => {
  const request: Partial<IAuthUser> = {
    ...data,
  }

  const response = await api.patch<{ user: IAuthUser }>("/auth/profile", request)
  return response.data.user
}

/**
 * PATCH - Update profile avatar
 */
export const updateAvatar = async (avatarFile: File): Promise<IAuthUser> => {
  const formData = new FormData()
  formData.append("avatar", avatarFile)

  const response = await api.patch<{ user: IAuthUser }>("/auth/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data.user
}

/**
 * PATCH - Change current password
 */
export const changePassword = async (
  input: IUpdatePasswordInput
): Promise<string> => {
  if (input.newPassword !== input.confirmPassword) {
    throw new Error("Passwords do not match")
  }

  const response = await api.patch<IApiResponse<string>>("/auth/change-password", {
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  })

  return response.data.message
}

/**
 * POST - Request password reset code
 * Backward-compatible helper for the current forgot-password flow
 */
export const requestPasswordReset = async (
  input: IForgotPasswordSendCodeInput
): Promise<string> => {
  const request: IForgotPasswordSendCodeInput = {
    email: input.email,
  }

  return sendForgotPasswordCode(request)
}

/**
 * PATCH - Reset password with code
 * Backward-compatible helper for the current forgot-password flow
 */
export const resetPassword = async (
  input: IForgotPasswordResetRequest
): Promise<string> => {
  const request: IForgotPasswordResetRequest = {
    email: input.email,
    code: input.code,
    newPassword: input.newPassword,
  }

  const response = await api.patch<IApiResponse<string>>(
    "/auth/forgot-password/reset-password",
    request
  )

  return response.data.message
}

/**
 * POST - Send forgot password verification code to email
 */
export const sendForgotPasswordCode = async (
  input: IForgotPasswordSendCodeInput
): Promise<string> => {
  const request: IForgotPasswordSendCodeInput = {
    email: input.email,
  }

  const response = await api.post<IApiResponse<string>>(
    "/auth/forgot-password/send-code",
    request
  )

  return response.data.message
}

/**
 * POST - Verify forgot password code
 */
export const verifyForgotPasswordCode = async (
  input: IForgotPasswordVerifyCodeInput
): Promise<string> => {
  const request: IForgotPasswordVerifyCodeInput = {
    email: input.email,
    code: input.code,
  }

  const response = await api.post<IApiResponse<string>>(
    "/auth/forgot-password/verify-code",
    request
  )

  return response.data.message
}

/**
 * POST - Reset password after code verification
 */
export const resetPasswordWithCode = async (
  input: IForgotPasswordResetPasswordInput
): Promise<string> => {
  if (input.newPassword !== input.confirmPassword) {
    throw new Error("Passwords do not match")
  }

  const request: IForgotPasswordResetRequest = {
    email: input.email,
    code: input.code,
    newPassword: input.newPassword,
  }

  const response = await api.patch<IApiResponse<string>>(
    "/auth/forgot-password/reset-password",
    request
  )

  return response.data.message
}
