import type {
  IActivityRecord,
  IPendingApproval,
  IProjectRecord,
  IResourceSnapshot,
  ITenantNavGroup,
} from "@/pages/tenant-admin/types"

export const TENANT_NAV_GROUPS: ITenantNavGroup[] = [
  {
    items: [
      { label: "Dashboard", icon: "grid_view", section: "dashboard" },
    ],
  },
  {
    title: "ORGANIZATION & PEOPLE",
    items: [
      { label: "Member Management", icon: "group", section: "organization" },
    ],
  },
  {
    title: "WORKSPACE",
    items: [
      { label: "Project List", icon: "assignment", section: "projects" },
    ],
  },
  {
    title: "SECURITY & TRACKING",
    items: [
      { label: "Audit Logs", icon: "security", section: "security" },
      { label: "Shared Links Manager", icon: "link", section: "security" },
    ],
  },
  {
    title: "BILLING & PLANS",
    items: [
      { label: "Subscription Info", icon: "credit_card" },
      { label: "Invoices", icon: "receipt" },
    ],
  },
]

export const PROJECT_RECORDS: IProjectRecord[] = [
  {
    id: "proj-001",
    name: "Project Orion",
    department: "Marketing",
    pm: "Sarah Jenkins",
    membersCount: 12,
    storageUsed: "45GB",
    storageTotal: "100GB",
    storagePercent: 45,
    status: "Active",
    icon: "folder",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "proj-002",
    name: "Cloud Infrastructure",
    department: "IT Operations",
    pm: "Admin David",
    membersCount: 8,
    storageUsed: "92GB",
    storageTotal: "100GB",
    storagePercent: 92,
    status: "Planning",
    icon: "cloud_queue",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    id: "proj-003",
    name: "Compliance Review",
    department: "Legal",
    pm: "Marcus Thorne",
    membersCount: 4,
    storageUsed: "12GB",
    storageTotal: "50GB",
    storagePercent: 24,
    status: "Active",
    icon: "gavel",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    id: "proj-004",
    name: "Brand Refresh",
    department: "Design",
    pm: "Kevin Art",
    membersCount: 6,
    storageUsed: "20GB",
    storageTotal: "100GB",
    storagePercent: 20,
    status: "Archived",
    icon: "palette",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "proj-005",
    name: "Internal Audit",
    department: "Finance",
    pm: "Janet Doe",
    membersCount: 2,
    storageUsed: "5GB",
    storageTotal: "50GB",
    storagePercent: 10,
    status: "Planning",
    icon: "account_balance",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
]

export const ACTIVITY_RECORDS: IActivityRecord[] = [
  {
    actor: "Sarah Jenkins",
    action: "uploaded",
    resource: "marketing_strategy_v2.pdf to Project Orion",
    timestamp: "24 minutes ago",
    dotColor: "#0052CC",
  },
  {
    actor: "Admin David",
    action: "approved",
    resource: "budget request for Cloud Infrastructure",
    timestamp: "1 hour ago",
    dotColor: "#36B37E",
  },
  {
    actor: "Marcus Thorne",
    action: "added 3 new members",
    resource: "to Compliance Review",
    timestamp: "3 hours ago",
    dotColor: "#FF991F",
  },
]

export const PENDING_APPROVALS: IPendingApproval[] = [
  {
    type: "annual_audit.xlsx",
    description: "From: Janet Doe",
    from: "pending",
    status: "pending",
    icon: "description",
  },
  {
    type: "brand_hero_final.png",
    description: "From: Kevin Art",
    from: "pending",
    status: "pending",
    icon: "image",
  },
  {
    type: "contract_draft_v1.zip",
    description: "From: Legal Team",
    from: "pending",
    status: "pending",
    icon: "attach_file",
  },
]

export const RESOURCE_SNAPSHOTS: IResourceSnapshot[] = [
  { department: "Board of Directors", used: 382.5, total: 500, status: "Active Growth", statusColor: "text-green-600" },
  { department: "Marketing", used: 255.0, total: 500, status: "Near Quota", statusColor: "text-amber-500" },
  { department: "Accounting", used: 127.5, total: 500, status: "Stable", statusColor: "text-gray-600" },
]

export const getSectionTitle = (section: string) => {
  if (section === "dashboard") {
    return "Dashboard Overview"
  }
  if (section === "projects") {
    return "Project Portfolio"
  }
  if (section === "organization") {
    return "Organization Control"
  }
  if (section === "security") {
    return "Security & Audit"
  }
  return "Management"
}

export const getSectionDescription = (section: string) => {
  if (section === "dashboard") {
    return "Real-time operational insights for your workspace."
  }
  if (section === "projects") {
    return "Manage project workspaces, access models, and resource growth across teams."
  }
  if (section === "organization") {
    return "Control member roles, department structures, and access boundaries in one place."
  }
  if (section === "security") {
    return "Track audit logs, investigate anomalies, and enforce workspace security policies."
  }
  return ""
}

export const getProjectStatusClassName = (status: IProjectRecord["status"]) => {
  if (status === "Active") {
    return "bg-cyan-100 text-cyan-600"
  }
  if (status === "Planning") {
    return "bg-amber-100 text-amber-500"
  }
  return "bg-gray-100 text-gray-600"
}
