import type { LucideIcon } from "lucide-react"

export type TSystemSection =
  | "dashboard"
  | "tenants"
  | "billing"
  | "account-management"

export type TTenantStatus = "Active" | "Trial" | "Suspended"

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

export type TBillingStatus = "Active" | "Inactive"
export type TBillingCycle = "Monthly" | "Quarterly" | "Yearly"

export interface IPlanCard {
  tier: string
  name: string
  price: string
  period: string
  status?: TBillingStatus
  description?: string
  storageLimit?: string
  maxUsers?: string
  isHighlighted?: boolean
  features: string[]
  tenants: string
}

export interface INewPlanInput {
  name: string
  status: TBillingStatus
  description: string
  storageLimit: DoubleRange
  maxUsers: number
  billingCycle: TBillingCycle
  price: string
  features: string[]
}
