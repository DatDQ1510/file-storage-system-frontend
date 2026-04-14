import { api } from "@/lib/api/axios-client"
import { TENANT_TABLE_DATA } from "@/pages/system-admin/constants"
import type {
  IAllTenantPageResponse,
  IInitialTenantSetupResponse,
  ITenantAdminAvailabilityResult,
  ITenantActivationPayload,
  ITenantActivationTokenInfo,
  ITenantProvisionPayload,
  ITenantRecordPage,
  ITenantRecord,
  ITenantSubdomainAvailabilityResult,
  TTenantStatus,
} from "@/pages/system-admin/types"
import type { IApiResponse } from "@/types/auth"
import {
  buildTenantProvisionPayload,
  isStrongPassword,
  normalizeSubdomainValue,
} from "@/helpers/validators/tenant-provision"

interface ICheckTenantAdminResponse {
  available: boolean
  isEmailAvailable?: boolean
  isPhoneNumberAvailable?: boolean
}

type TCheckTenantAdminApiData = boolean | ICheckTenantAdminResponse

interface ICheckTenantAdminInput {
  username: string
  email: string
  phoneNumber: string
}

interface ICreateInitialTenantSetupRequest {
  nameTenant: string
  subdomain: string
  username: string
  email: string
  phoneNumber: string
  planId: string
}

interface IGetTenantRecordsInput {
  page: number
  offset: number
}

const unwrapApiData = <TData>(payload: unknown): TData | null => {
  if (!payload || typeof payload !== "object") {
    return null
  }

  if ("data" in payload) {
    const wrappedData = (payload as { data?: unknown }).data
    return (wrappedData as TData) ?? null
  }

  return payload as TData
}

export const fetchTenantRecords = async (): Promise<ITenantRecord[]> => {
  // TODO: Replace mock implementation with real backend request
  return Promise.resolve(TENANT_TABLE_DATA)
}

const toNumericValue = (value: string | number | null | undefined): number => {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : 0
  }

  return 0
}

const toUiTenantStatus = (statusTenant: string): TTenantStatus => {
  const normalizedStatus = statusTenant.trim().toUpperCase()

  if (normalizedStatus.includes("SUSPEND") || normalizedStatus.includes("INACTIVE") || normalizedStatus.includes("DISABLE")) {
    return "Suspended"
  }

  if (normalizedStatus.includes("ACTIVE")) {
    return "Active"
  }

  return "Trial"
}

const toLocaleDateLabel = (input: string): string => {
  const value = new Date(input)

  if (Number.isNaN(value.getTime())) {
    return "N/A"
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

const mapApiTenantToTenantRecord = (tenant: IAllTenantPageResponse["items"][number]): ITenantRecord => {
  const usedStorageSize = toNumericValue(tenant.usedStorageSize)
  const planBaseStorageLimit = toNumericValue(tenant.planBaseStorageLimit)
  const exTraStorageSize = toNumericValue(tenant.exTraStorageSize)
  const totalStorageSize = planBaseStorageLimit + exTraStorageSize
  const quotaPercent =
    totalStorageSize <= 0 ? 0 : Math.min(Math.round((usedStorageSize / totalStorageSize) * 100), 100)

  return {
    id: tenant.id,
    businessName: tenant.nameTenant,
    nodeCode: tenant.domainTenant,
    status: toUiTenantStatus(tenant.statusTenant),
    plan: tenant.planName,
    quotaUsed: `${usedStorageSize.toLocaleString("en-US")} GB`,
    quotaPercent,
    createdDate: toLocaleDateLabel(tenant.createdAt),
    region: "Vietnam",
    adminName: tenant.tenantAdminUserName,
    adminEmail: tenant.tenantAdminEmail,
    adminPhoneNumber: tenant.tenantAdminPhoneNumber,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
    tenantAdminId: tenant.tenantAdminId,
    tenantPlanStatus: tenant.tenantPlanStatus,
    planPrice: tenant.planPrice ?? undefined,
    planBillingCycle: tenant.planBillingCycle,
    planStartDate: tenant.planStartDate,
    planEndDate: tenant.planEndDate,
  }
}

const buildMockTenantRecordPage = ({ page, offset }: IGetTenantRecordsInput): ITenantRecordPage => {
  const totalElements = TENANT_TABLE_DATA.length
  const totalPages = Math.max(Math.ceil(totalElements / offset), 1)
  const boundedPage = Math.min(page, totalPages - 1)
  const startIndex = boundedPage * offset
  const endIndex = startIndex + offset
  const items = TENANT_TABLE_DATA.slice(startIndex, endIndex)

  return {
    items,
    page: boundedPage,
    offset,
    totalElements,
    totalPages,
    hasNext: boundedPage < totalPages - 1,
    hasPrevious: boundedPage > 0,
    isMockData: true,
  }
}

export const fetchTenantRecordPage = async ({
  page,
  offset,
}: IGetTenantRecordsInput): Promise<ITenantRecordPage> => {
  try {
    const response = await api.get<IApiResponse<IAllTenantPageResponse>>("/tenants", {
      params: {
        page,
        offset,
      },
      skipGlobalErrorHandler: true,
    })

    const payload = response.data.data
    return {
      items: payload.items.map(mapApiTenantToTenantRecord),
      page: payload.page,
      offset: payload.offset,
      totalElements: payload.totalElements,
      totalPages: payload.totalPages,
      hasNext: payload.hasNext,
      hasPrevious: payload.hasPrevious,
      isMockData: false,
    }
  } catch {
    return buildMockTenantRecordPage({ page, offset })
  }
}

export const checkTenantSubdomainAvailability = async (
  subdomain: string
): Promise<ITenantSubdomainAvailabilityResult> => {
  const normalizedSubdomain = normalizeSubdomainValue(subdomain)

  if (!normalizedSubdomain) {
    return {
      subdomain: "",
      isAvailable: false,
      message: "Subdomain is required.",
    }
  }

  const response = await api.request<IApiResponse<boolean> | boolean>({
    url: "/tenants/check-tenant",
    method: "GET",
    params: {
      domainTenant: normalizedSubdomain,
    },
    skipGlobalErrorHandler: true,
  })

  const payload = response.data
  const maybeWrappedMessage =
    typeof payload === "object" && payload && "message" in payload
      ? String((payload as { message?: string }).message ?? "")
      : ""
  const exists = Boolean(unwrapApiData<boolean>(payload))

  return {
    subdomain: normalizedSubdomain,
    isAvailable: !exists,
    message:
      maybeWrappedMessage ||
      (exists ? "Domain tenant already exists" : "Domain tenant is available"),
  }
}

export const checkTenantAdminAvailability = async (
  input: ICheckTenantAdminInput
): Promise<ITenantAdminAvailabilityResult> => {
  const normalizedUsername = input.username.trim()
  const normalizedEmail = input.email.trim().toLowerCase()
  const normalizedPhoneNumber = input.phoneNumber.trim()

  if (!normalizedUsername || !normalizedEmail || !normalizedPhoneNumber) {
    return {
      available: false,
      message: "Username, email and phone number are required.",
      isEmailAvailable: false,
      isPhoneNumberAvailable: false,
    }
  }

  const response = await api.request<IApiResponse<ICheckTenantAdminResponse> | ICheckTenantAdminResponse>({
    url: "/tenant-admins/check-tenantAdmin",
    method: "GET",
    params: {
      username: normalizedUsername,
      email: normalizedEmail,
      phoneNumber: normalizedPhoneNumber,
    },
    skipGlobalErrorHandler: true,
  })

  const payload = response.data
  const maybeWrappedMessage =
    typeof payload === "object" && payload && "message" in payload
      ? String((payload as { message?: string }).message ?? "")
      : ""
  const checkResult = unwrapApiData<TCheckTenantAdminApiData>(payload)

  const isAvailable =
    typeof checkResult === "boolean"
      ? !checkResult
      : Boolean(checkResult?.available)

  const isEmailAvailable =
    typeof checkResult === "boolean"
      ? undefined
      : checkResult?.isEmailAvailable

  const isPhoneNumberAvailable =
    typeof checkResult === "boolean"
      ? undefined
      : checkResult?.isPhoneNumberAvailable

  return {
    available: isAvailable,
    message:
      maybeWrappedMessage ||
      (isAvailable
        ? "Email and phone number are available"
        : "Email or phone number   already exists"),
    isEmailAvailable,
    isPhoneNumberAvailable,
  }
}

export const provisionTenant = async (
  input: ITenantProvisionPayload
): Promise<IInitialTenantSetupResponse> => {
  const payload = buildTenantProvisionPayload(
    input.companyName,
    input.subdomain,
    input.admin,
    input.plan
  )

  const request: ICreateInitialTenantSetupRequest = {
    nameTenant: payload.companyName,
    subdomain: payload.subdomain,
    username: payload.admin.fullName,
    email: payload.admin.email,
    phoneNumber: payload.admin.phoneNumber,
    planId: payload.plan.id ?? "",
  }

  const response = await api.post<IApiResponse<IInitialTenantSetupResponse>>(
    "/system-admins/create-initial",
    request,
    {
      skipGlobalErrorHandler: true,
    }
  )

  return response.data.data
}

export const validateTenantActivationToken = async (
  token: string
): Promise<ITenantActivationTokenInfo> => {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    return {
      isValid: false,
      message: "Activation token is required.",
    }
  }

  const response = await api.get<ITenantActivationTokenInfo>(
    "/tenants/activation/validate",
    {
      params: {
        token: normalizedToken,
      },
      skipGlobalErrorHandler: true,
    }
  )

  return response.data
}

export const activateTenantAccount = async (input: ITenantActivationPayload) => {
  const isPasswordStrong = isStrongPassword(input.password)

  if (!isPasswordStrong) {
    throw new Error("Password does not meet the security requirements.")
  }

  const response = await api.post<{ accessToken?: string; message?: string }>(
    "/tenants/activation/complete",
    input,
    {
      skipGlobalErrorHandler: true,
    }
  )

  return response.data
}
