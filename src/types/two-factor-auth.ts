export interface ITwoFASetupResponse {
  qrCodeDataUrl?: string
  qrCodeUrl?: string
  manualEntryKey?: string
  secret?: string
}

export interface ITwoFAStatusResponse {
  enabled: boolean
  verifiedAt?: string | null
  qrCodeDataUrl?: string
  qrCodeUrl?: string
  manualEntryKey?: string
  secret?: string
}

export interface ITwoFAVerifyInput {
  code: string
  usernameOrEmail?: string
}

export type TTwoFAToggleAction = "enable" | "disable"