export type TSystemAdminTenantStatus = "Active" | "Trial" | "Suspended"

export type TSystemAdminInfrastructureSection =
  | "redis-status"
  | "rabbitmq-queue"
  | "storage-nodes"
  | "global-audit-logs"
  | "blocked-ips"

export interface ISystemAdminDashboardMetrics {
  totalTenants: number
  activeTenants: number
  trialTenants: number
  suspendedTenants: number
  monthlyRevenue: number
  averageQuotaUsagePercent: number
}

export interface ISystemAdminTenant {
  id: string
  businessName: string
  nodeCode: string
  status: TSystemAdminTenantStatus
  plan: string
  quotaUsed: string
  quotaPercent: number
  createdDate: string
  region: string
  adminName: string
  adminEmail: string
}

export interface ISystemAdminTenantListQuery {
  search?: string
  status?: TSystemAdminTenantStatus | "all"
  page?: number
  pageSize?: number
}

export interface ISystemAdminPaginatedResult<TData> {
  items: TData[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ISystemAdminRegisterTenantInput {
  businessName: string
  nodeCode: string
  plan: string
  region: string
  adminName: string
  adminEmail: string
}

export interface ISystemAdminUpdateTenantStatusInput {
  status: TSystemAdminTenantStatus
}

export interface ISystemAdminUpdateTenantQuotaInput {
  quotaPercent: number
  quotaUsed?: string
}

export interface ISystemAdminPlan {
  id: string
  tier: string
  name: string
  price: string
  period: string
  isHighlighted?: boolean
  features: string[]
  tenants: string
}

export interface ISystemAdminCreatePlanInput {
  tier: string
  name: string
  price: string
  period: string
  features: string[]
  isHighlighted?: boolean
}

export type ISystemAdminUpdatePlanInput = Partial<ISystemAdminCreatePlanInput>

export interface ISystemAdminBillingRule {
  automaticProrating: boolean
  churnAlerts: boolean
  autoApplyCredits: boolean
}

export interface ISystemAdminInfrastructureRecord {
  id: string
  section: TSystemAdminInfrastructureSection
  resourceName: string
  status: string
  region: string
  updatedAt: string
  detail?: string
}

export interface ISystemAdminBlockIpInput {
  ipAddress: string
  reason: string
}
