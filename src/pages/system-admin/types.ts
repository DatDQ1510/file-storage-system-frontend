import type { LucideIcon } from "lucide-react"

export type TSystemSection =
  | "dashboard"
  | "tenants"
  | "billing"
  | "account-management"

export type TTenantStatus = "Active" | "Trial" | "Suspended"

export type TTenantApiStatus =
  | "ACTIVE"
  | "TRIAL"
  | "SUSPENDED"
  | "INACTIVE"
  | "UNKNOWN"

export interface ISystemNavItem {
  label: string
  icon: LucideIcon
  section?: TSystemSection
}

export interface ISystemNavGroup {
  title: string
  items: ISystemNavItem[]
}

export interface ITenantRecord {
  id?: string
  businessName: string
  nodeCode: string
  status: TTenantStatus
  plan: string
  quotaUsed: string
  quotaPercent: number
  createdDate: string
  region: string
  adminName: string
  adminEmail: string
  adminPhoneNumber?: string
  createdAt?: string
  updatedAt?: string
  tenantAdminId?: string
  tenantPlanStatus?: string
  planPrice?: number
  planBillingCycle?: string
  planStartDate?: string
  planEndDate?: string
  usedStorageSize?: number
  exTraStorageSize?: number
}

export interface IAllTenantResponse {
  id: string
  nameTenant: string
  domainTenant: string
  exTraStorageSize: string | number | null
  usedStorageSize: string | number | null
  statusTenant: string
  tenantAdminId: string
  tenantAdminUserName: string
  tenantAdminEmail: string
  tenantAdminPhoneNumber: string
  planId: string
  planName: string
  planBaseStorageLimit: string | number | null
  planPrice: number | null
  planBillingCycle: string
  tenantPlanStatus: string
  planStartDate: string
  planEndDate: string
  createdAt: string
  updatedAt: string
}

export interface IAllTenantPageResponse {
  items: IAllTenantResponse[]
  page: number
  offset: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ITenantRecordPage {
  items: ITenantRecord[]
  page: number
  offset: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  isMockData?: boolean
}

export interface ITenantCreateInput {
  businessName: string
  nodeCode: string
  status: TTenantStatus
  plan: string
  extraStorageSize: number
  storageUnit: "GB" | "TB"
  region: string
  adminName: string
  adminEmail: string
}

export type TTenantProvisionPlanName = string

export interface ITenantProvisionPlan {
  id?: string
  name: TTenantProvisionPlanName
  storageQuota: string
  maxUsers: number
  description: string
}

export interface ITenantProvisionAdminInput {
  fullName: string
  email: string
  phoneNumber: string
}

export interface ITenantProvisionPayload {
  companyName: string
  subdomain: string
  admin: ITenantProvisionAdminInput
  plan: ITenantProvisionPlan
}

export interface ITenantSubdomainAvailabilityResult {
  subdomain: string
  isAvailable: boolean
  message: string
}

export interface ITenantAdminAvailabilityResult {
  available: boolean
  message: string
  isEmailAvailable?: boolean
  isPhoneNumberAvailable?: boolean
}

export interface ITenantProvisionResponse {
  tenantId: string
  companyName: string
  subdomain: string
  activationToken: string
  activationLink: string
  plan: ITenantProvisionPlan
  adminEmail: string
  message: string
}

export interface IInitialTenantSetupResponse {
  tenantId: string
  tenantDomain: string
  tenantAdminId: string
  tenantAdminUserName: string
  tenantPlanId: string
  planId: string
  tenantPlanStartDate: string
  tenantPlanEndDate: string
  generatedTenantAdminPassword: string
}

export interface ITenantActivationTokenInfo {
  isValid: boolean
  message: string
  companyName?: string
  subdomain?: string
  adminEmail?: string
  expiresAt?: string
}

export interface ITenantActivationPayload {
  token: string
  password: string
  confirmPassword: string
}

export type TBillingStatus = "Active" | "Inactive"
export type TBillingCycle = "Monthly" | "Quarterly" | "Yearly"

export interface IPlanCard {
  id?: string
  tier: string
  name: string
  price: string
  period: string
  status?: TBillingStatus
  description?: string
  storageLimit?: string | number
  maxUsers?: string | number
  isHighlighted?: boolean
  features: string[]
  tenants: string
}

export interface INewPlanInput {
  name: string
  status: TBillingStatus
  description: string
  storageLimit: number
  maxUsers: number
  billingCycle: TBillingCycle
  price: number
  features: string[]
}
