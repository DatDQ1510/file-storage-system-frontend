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
} from "@/types/auth"

const TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const AUTH_DATA_KEY = "authData"

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
): Promise<IAuthTokenResponse> => {
  const request: ISignInInput = {
    usernameOrEmail: input.usernameOrEmail,
    password: input.password,
  }

  const response = await api.post<ISignInResponse>(
    "/auth/login",
    request,
    {
      withCredentials: true,
    }
  )

  const { accessToken } = response.data.data

  // Store tokens in localStorage
  storeTokens(accessToken)
  storeAuthData(response.data.data)

  return response.data.data
}

/**
 * POST - Sign in with TOTP code from authenticator app
 */
export const signInWithTotp = async (
  input: ISignInWithTotpInput
): Promise<IAuthTokenResponse> => {
  const request: ISignInWithTotpInput = {
    usernameOrEmail: input.usernameOrEmail,
    code: input.code,
  }

  const response = await api.post<ISignInResponse>(
    "/auth/login/totp",
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
 * @returns Current authenticated user
 */
export const getCurrentUser = async (): Promise<IAuthUser> => {
  const response = await api.get<{ user: IAuthUser }>("/auth/me")
  return response.data.user
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

  const response = await api.put<{ user: IAuthUser }>("/auth/profile", request)
  return response.data.user
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
