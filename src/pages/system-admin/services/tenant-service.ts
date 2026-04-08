import type {
  ITenantAdminAvailabilityResult,
  ITenantActivationPayload,
  ITenantActivationTokenInfo,
  ITenantProvisionPayload,
  ITenantProvisionResponse,
  ITenantRecord,
  ITenantSubdomainAvailabilityResult,
} from "@/pages/system-admin/types"
import {
  activateTenantAccount,
  checkTenantAdminAvailability,
  checkTenantSubdomainAvailability,
  fetchTenantRecords,
  provisionTenant,
  validateTenantActivationToken,
} from "@/pages/system-admin/api/tenant-api"

export const loadTenantRecords = async (): Promise<ITenantRecord[]> => {
  return fetchTenantRecords()
}

export const checkSubdomainAvailability = async (
  subdomain: string
): Promise<ITenantSubdomainAvailabilityResult> => {
  return checkTenantSubdomainAvailability(subdomain)
}

export const checkAdminAvailability = async (input: {
  username: string
  email: string
  sdt: string
}): Promise<ITenantAdminAvailabilityResult> => {
  return checkTenantAdminAvailability(input)
}

export const submitTenantProvision = async (
  input: ITenantProvisionPayload
): Promise<ITenantProvisionResponse> => {
  return provisionTenant(input)
}

export const verifyActivationToken = async (
  token: string
): Promise<ITenantActivationTokenInfo> => {
  return validateTenantActivationToken(token)
}

export const completeTenantActivation = async (
  input: ITenantActivationPayload
): Promise<{ accessToken?: string; message?: string }> => {
  return activateTenantAccount(input)
}
