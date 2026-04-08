import type {
  ITenantActivationPayload,
  ITenantProvisionAdminInput,
  ITenantProvisionPayload,
  ITenantProvisionPlan,
  ITenantSubdomainAvailabilityResult,
} from "@/pages/system-admin/types"

export interface IPasswordRequirement {
  key: string
  label: string
  isMet: boolean
}

export interface IPasswordStrengthAssessment {
  score: number
  percent: number
  label: string
  requirements: IPasswordRequirement[]
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/
const LOWERCASE_PATTERN = /[a-z]/
const UPPERCASE_PATTERN = /[A-Z]/
const NUMBER_PATTERN = /\d/
const SPECIAL_CHARACTER_PATTERN = /[^A-Za-z0-9]/

export const normalizeTrimmedValue = (value: string) => value.trim()

export const normalizeSubdomainValue = (value: string) => {
  const normalizedValue = value.trim().toLowerCase().replace(/^https?:\/\//, "")
  const hostPart = normalizedValue.split(/[/?#]/)[0] ?? ""
  const hostWithoutPort = hostPart.split(":")[0] ?? ""

  return hostWithoutPort.replace(/\.$/, "")
}

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(normalizeTrimmedValue(value))

export const isValidPhoneNumber = (value: string) => PHONE_PATTERN.test(normalizeTrimmedValue(value))

export const isValidTenantSubdomain = (value: string) => {
  return Boolean(normalizeSubdomainValue(value))
}

export const isValidTenantProvisionAdmin = (admin: ITenantProvisionAdminInput) => {
  return isValidEmail(admin.email) && Boolean(normalizeTrimmedValue(admin.fullName)) && isValidPhoneNumber(admin.phoneNumber)
}

export const evaluatePasswordStrength = (password: string): IPasswordStrengthAssessment => {
  const normalizedPassword = password ?? ""
  const requirements: IPasswordRequirement[] = [
    { key: "length", label: "At least 8 characters", isMet: normalizedPassword.length >= 8 },
    { key: "uppercase", label: "One uppercase letter", isMet: UPPERCASE_PATTERN.test(normalizedPassword) },
    { key: "lowercase", label: "One lowercase letter", isMet: LOWERCASE_PATTERN.test(normalizedPassword) },
    { key: "number", label: "One number", isMet: NUMBER_PATTERN.test(normalizedPassword) },
    { key: "special", label: "One special character", isMet: SPECIAL_CHARACTER_PATTERN.test(normalizedPassword) },
  ]

  const score = requirements.filter((requirement) => requirement.isMet).length
  const labelByScore = ["Very weak", "Weak", "Fair", "Strong", "Very strong", "Excellent"]

  return {
    score,
    percent: Math.min(score * 20, 100),
    label: labelByScore[Math.min(score, labelByScore.length - 1)],
    requirements,
  }
}

export const isStrongPassword = (value: string) => {
  return evaluatePasswordStrength(value).score >= 3
}

export const buildTenantProvisionPayload = (
  companyName: string,
  subdomain: string,
  admin: ITenantProvisionAdminInput,
  plan: ITenantProvisionPlan
): ITenantProvisionPayload => {
  return {
    companyName: normalizeTrimmedValue(companyName),
    subdomain: normalizeSubdomainValue(subdomain),
    admin: {
      fullName: normalizeTrimmedValue(admin.fullName),
      email: normalizeTrimmedValue(admin.email).toLowerCase(),
      phoneNumber: normalizeTrimmedValue(admin.phoneNumber),
    },
    plan,
  }
}

export const buildActivationPayload = (token: string, password: string, confirmPassword: string): ITenantActivationPayload => {
  return {
    token: normalizeTrimmedValue(token),
    password,
    confirmPassword,
  }
}

export const getTenantSubdomainAvailabilityMessage = (
  result: ITenantSubdomainAvailabilityResult
) => {
  if (result.isAvailable) {
    return result.message || "Subdomain is available."
  }

  return result.message || "Subdomain is already taken."
}