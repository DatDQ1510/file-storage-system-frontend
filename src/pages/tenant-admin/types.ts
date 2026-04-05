export type TTenantAdminSection = "dashboard" | "projects" | "organization" | "security"

export interface ITenantNavItem {
  label: string
  icon: string
  section?: TTenantAdminSection
}

export interface ITenantNavGroup {
  title?: string
  items: ITenantNavItem[]
}

export interface IProjectRecord {
  id: string
  name: string
  department: string
  pm: string
  membersCount: number
  storageUsed: string
  storageTotal: string
  storagePercent: number
  status: "Active" | "Planning" | "Archived"
  icon: string
  iconBg: string
  iconColor: string
}

export interface IActivityRecord {
  actor: string
  action: string
  resource: string
  timestamp: string
  dotColor: string
}

export interface IPendingApproval {
  type: string
  description: string
  from: string
  status: "pending" | "urgent"
  icon: string
}

export interface IResourceSnapshot {
  department: string
  used: number
  total: number
  status: string
  statusColor: string
}
