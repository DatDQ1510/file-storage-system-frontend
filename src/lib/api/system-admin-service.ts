import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"
import type {
  ISystemAdminBillingRule,
  ISystemAdminBlockIpInput,
  ISystemAdminCreatePlanInput,
  ISystemAdminDashboardMetrics,
  ISystemAdminInfrastructureRecord,
  ISystemAdminPaginatedResult,
  ISystemAdminPlan,
  ISystemAdminRegisterTenantInput,
  ISystemAdminTenant,
  ISystemAdminTenantListQuery,
  ISystemAdminUpdatePlanInput,
  ISystemAdminUpdateTenantQuotaInput,
  ISystemAdminUpdateTenantStatusInput,
  TSystemAdminInfrastructureSection,
} from "@/types/system-admin"

const SYSTEM_ADMIN_BASE_PATH = "/system-admin"

export const getSystemAdminDashboardMetrics = async (): Promise<ISystemAdminDashboardMetrics> => {
  const response = await api.get<IApiResponse<ISystemAdminDashboardMetrics>>(
    `${SYSTEM_ADMIN_BASE_PATH}/dashboard/metrics`
  )

  return response.data.data
}

export const getSystemAdminTenants = async (
  query?: ISystemAdminTenantListQuery
): Promise<ISystemAdminPaginatedResult<ISystemAdminTenant>> => {
  const response = await api.get<IApiResponse<ISystemAdminPaginatedResult<ISystemAdminTenant>>>(
    `${SYSTEM_ADMIN_BASE_PATH}/tenants`,
    {
      params: query,
    }
  )

  return response.data.data
}

export const registerSystemAdminTenant = async (
  input: ISystemAdminRegisterTenantInput
): Promise<ISystemAdminTenant> => {
  const request: ISystemAdminRegisterTenantInput = {
    businessName: input.businessName,
    nodeCode: input.nodeCode,
    plan: input.plan,
    region: input.region,
    adminName: input.adminName,
    adminEmail: input.adminEmail,
  }

  const response = await api.post<IApiResponse<ISystemAdminTenant>>(
    `${SYSTEM_ADMIN_BASE_PATH}/tenants`,
    request
  )

  return response.data.data
}

export const updateSystemAdminTenantStatus = async (
  tenantId: string,
  input: ISystemAdminUpdateTenantStatusInput
): Promise<ISystemAdminTenant> => {
  const response = await api.patch<IApiResponse<ISystemAdminTenant>>(
    `${SYSTEM_ADMIN_BASE_PATH}/tenants/${tenantId}/status`,
    input
  )

  return response.data.data
}

export const updateSystemAdminTenantQuota = async (
  tenantId: string,
  input: ISystemAdminUpdateTenantQuotaInput
): Promise<ISystemAdminTenant> => {
  const response = await api.put<IApiResponse<ISystemAdminTenant>>(
    `${SYSTEM_ADMIN_BASE_PATH}/tenants/${tenantId}/quota`,
    input
  )

  return response.data.data
}

export const getSystemAdminPlans = async (): Promise<ISystemAdminPlan[]> => {
  const response = await api.get<IApiResponse<ISystemAdminPlan[]>>(
    `${SYSTEM_ADMIN_BASE_PATH}/billing/plans`
  )

  return response.data.data
}

export const createSystemAdminPlan = async (
  input: ISystemAdminCreatePlanInput
): Promise<ISystemAdminPlan> => {
  const response = await api.post<IApiResponse<ISystemAdminPlan>>(
    `${SYSTEM_ADMIN_BASE_PATH}/billing/plans`,
    input
  )

  return response.data.data
}

export const updateSystemAdminPlan = async (
  planId: string,
  input: ISystemAdminUpdatePlanInput
): Promise<ISystemAdminPlan> => {
  const response = await api.patch<IApiResponse<ISystemAdminPlan>>(
    `${SYSTEM_ADMIN_BASE_PATH}/billing/plans/${planId}`,
    input
  )

  return response.data.data
}

export const getSystemAdminBillingRules = async (): Promise<ISystemAdminBillingRule> => {
  const response = await api.get<IApiResponse<ISystemAdminBillingRule>>(
    `${SYSTEM_ADMIN_BASE_PATH}/billing/rules`
  )

  return response.data.data
}

export const updateSystemAdminBillingRules = async (
  input: ISystemAdminBillingRule
): Promise<ISystemAdminBillingRule> => {
  const response = await api.put<IApiResponse<ISystemAdminBillingRule>>(
    `${SYSTEM_ADMIN_BASE_PATH}/billing/rules`,
    input
  )

  return response.data.data
}

export const getSystemAdminInfrastructureRecords = async (
  section?: TSystemAdminInfrastructureSection
): Promise<ISystemAdminInfrastructureRecord[]> => {
  const response = await api.get<IApiResponse<ISystemAdminInfrastructureRecord[]>>(
    `${SYSTEM_ADMIN_BASE_PATH}/infrastructure/records`,
    {
      params: section ? { section } : undefined,
    }
  )

  return response.data.data
}

export const blockSystemAdminIp = async (
  input: ISystemAdminBlockIpInput
): Promise<void> => {
  await api.post<IApiResponse<null>>(`${SYSTEM_ADMIN_BASE_PATH}/security/blocked-ips`, input)
}

export const unblockSystemAdminIp = async (ipAddress: string): Promise<void> => {
  await api.delete(`${SYSTEM_ADMIN_BASE_PATH}/security/blocked-ips/${encodeURIComponent(ipAddress)}`)
}
