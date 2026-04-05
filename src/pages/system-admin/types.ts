import type { LucideIcon } from "lucide-react"

export type TSystemSection =
  | "dashboard"
  | "tenants"
  | "quota"
  | "billing"
  | "redis-status"
  | "rabbitmq-queue"
  | "storage-nodes"
  | "global-audit-logs"
  | "blocked-ips"

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

export interface IPlanCard {
  tier: string
  name: string
  price: string
  period: string
  isHighlighted?: boolean
  features: string[]
  tenants: string
}
