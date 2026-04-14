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

export interface ICreateTenantUserRequest {
  userName: string
  email: string
  password: string
  phoneNumber: string
  department: string
}

export interface ICreateTenantUserResponse {
  id?: string
  userName?: string
  email?: string
  phoneNumber?: string
  department?: string
}

export type TTenantUserStatus = "Active" | "Pending" | "Suspended"

export interface IAllUserResponse {
  userName: string
  email: string
  phoneNumber: string
  department: string
  status: string
  MFAEnabled: boolean
  storage: string | number | null
  createdAt?: string
}

export interface IAllUserPageResponse {
  items: IAllUserResponse[]
  page: number
  offset: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface IUserDirectoryRecord {
  id: string
  fullName: string
  email: string
  phone: string
  employeeCode: string
  department: string
  status: TTenantUserStatus
  joinedAt: string
  mfaEnabled: boolean
  storageUsed: string
}

export interface IUserDirectoryPage {
  items: IUserDirectoryRecord[]
  page: number
  offset: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  isMockData?: boolean
}

export interface IProjectOwnerOption {
  id: string
  name: string
  email?: string
}

export interface IUserSearchItemResponse {
  id: string
  userName: string
  email: string
}

export interface IUserSearchPageResponse {
  items: IUserSearchItemResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface IProjectRequest {
  nameProject: string
  ownerId: string
}

export interface IProjectResponse {
  id?: string
  nameProject?: string
  ownerId?: string
  ownerName?: string
  tenantId?: string
  tenantName?: string
  tenantAdminId?: string
  tenantAdminName?: string
  createdAt?: string
  updatedAt?: string
  status?: string
}
