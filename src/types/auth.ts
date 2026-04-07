/**
 * Authentication Types
 * Interfaces for login, signup, and user data
 */

export interface ISignInInput {
  usernameOrEmail: string
  password: string
}

export type TUserRole = "SYSTEM_ADMIN" | "TENANT_ADMIN" | "USER"

export interface IAuthTokenResponse {
  accessToken: string
  tokenType: string
  accessTokenExpiresInMs: number
  role: TUserRole
  tenantId: string | null
  userId: string
  username: string
  email: string
  permissions: string[]
  redirectUrl: string
  userDisplayName: string
}

export interface ISignInResult extends Partial<IAuthTokenResponse> {
  requiresTwoFactor?: boolean
  pendingUsernameOrEmail?: string
}

export interface ISignUpInput {
  name: string
  usernameOrEmail: string
  password: string
  confirmPassword: string
}

export interface IAuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  jobTitle?: string
  department?: string
  role: TUserRole
}

export interface IAuthResponse {
  user: IAuthUser
  token: string
  refreshToken?: string
  expiresIn?: number
}

export interface IUpdatePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ISignInResponse {
  statusCode: number
  message: string
  success: boolean
  data: IAuthTokenResponse
}

export interface ISignUpResponse {
  statusCode: number
  message: string
  success: boolean
  data: IAuthResponse
}

export interface IForgotPasswordSendCodeInput {
  email: string
}

export interface IForgotPasswordVerifyCodeInput {
  email: string
  code: string
}

export interface IForgotPasswordResetRequest {
  email: string
  code: string
  newPassword: string
}

export interface IApiResponse<T> {
  statusCode: number
  message: string
  success: boolean
  data: T
}

export interface IForgotPasswordResetPasswordInput
  extends IForgotPasswordResetRequest {
  confirmPassword: string
}

export interface ISignInWithTotpInput {
  email: string
  code: string
}
