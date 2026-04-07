import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"
import type {
  ITwoFASetupResponse,
  ITwoFAStatusResponse,
  ITwoFAVerifyInput,
} from "@/types/two-factor-auth"

const TWO_FA_BASE_PATH = "/2fa"

const toDataUrl = (value: unknown) => {
  if (typeof value !== "string") {
    return ""
  }

  const normalized = value.trim()

  if (!normalized) {
    return ""
  }

  if (normalized.startsWith("data:image")) {
    return normalized
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized
  }

  if (normalized.startsWith("otpauth://")) {
    return ""
  }

  return `data:image/png;base64,${normalized}`
}

const normalizeSetupResponse = (payload: unknown): ITwoFASetupResponse => {
  const data = (payload ?? {}) as Record<string, unknown>

  const qrCodeDataUrl = toDataUrl(
    data.qrCodeDataUrl ?? data.qrCode ?? data.qrCodeBase64 ?? data.qrImageBase64
  )

  const qrCodeUrl =
    typeof data.qrCodeUrl === "string"
      ? data.qrCodeUrl
      : typeof data.otpauthUrl === "string"
      ? data.otpauthUrl
      : ""

  const manualEntryKey =
    typeof data.manualEntryKey === "string"
      ? data.manualEntryKey
      : typeof data.secret === "string"
      ? data.secret
      : typeof data.secretKey === "string"
      ? data.secretKey
      : ""

  return {
    qrCodeDataUrl: qrCodeDataUrl || undefined,
    qrCodeUrl: qrCodeUrl || undefined,
    manualEntryKey: manualEntryKey || undefined,
    secret: manualEntryKey || undefined,
  }
}

export const setupTwoFactor = async (): Promise<ITwoFASetupResponse> => {
  const response = await api.post<IApiResponse<ITwoFASetupResponse>>(
    `${TWO_FA_BASE_PATH}/setup`,
    {}
  )

  return normalizeSetupResponse(response.data.data)
}

export const verifyTwoFactor = async (
  input: ITwoFAVerifyInput
): Promise<string> => {
  const response = await api.post<IApiResponse<string>>(
    `${TWO_FA_BASE_PATH}/verify`,
    {
      code: input.code,
    }
  )

  return response.data.message
}

export const getTwoFactorStatus = async (): Promise<ITwoFAStatusResponse> => {
  const response = await api.get<IApiResponse<ITwoFAStatusResponse>>(
    `${TWO_FA_BASE_PATH}/status`
  )

  return response.data.data
}

export const disableTwoFactor = async (): Promise<string> => {
  const response = await api.delete<IApiResponse<string>>(
    `${TWO_FA_BASE_PATH}/disable`
  )

  return response.data.message
}
