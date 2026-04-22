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
      { label: "Tổng quan", icon: "grid_view", section: "dashboard" },
    ],
  },
  {
    title: "TỔ CHỨC & NHÂN SỰ",
    items: [
      { label: "Quản lý thành viên", icon: "group", section: "organization" },
    ],
  },
  {
    title: "KHÔNG GIAN LÀM VIỆC",
    items: [
      { label: "Danh sách dự án", icon: "assignment", section: "projects" },
    ],
  },
  {
    title: "BẢO MẬT & THEO DÕI",
    items: [
      { label: "Nhật ký kiểm toán", icon: "security", section: "security" },
      { label: "Quản lý liên kết chia sẻ", icon: "link", section: "security" },
    ],
  },
  {
    title: "THANH TOÁN & GÓI DỊCH VỤ",
    items: [
      { label: "Thông tin gói", icon: "credit_card" },
      { label: "Hóa đơn", icon: "receipt" },
    ],
  },
]

export const PROJECT_RECORDS: IProjectRecord[] = [
  {
    id: "proj-001",
    name: "Project Orion",
    ownerId: "usr-001",
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
    ownerId: "usr-002",
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
    ownerId: "usr-003",
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
    ownerId: "usr-004",
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
    ownerId: "usr-005",
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
    action: "đã tải lên",
    resource: "marketing_strategy_v2.pdf vào Project Orion",
    timestamp: "24 phút trước",
    dotColor: "#0052CC",
  },
  {
    actor: "Admin David",
    action: "đã phê duyệt",
    resource: "đề nghị ngân sách cho Cloud Infrastructure",
    timestamp: "1 giờ trước",
    dotColor: "#36B37E",
  },
  {
    actor: "Marcus Thorne",
    action: "đã thêm 3 thành viên mới",
    resource: "vào Compliance Review",
    timestamp: "3 giờ trước",
    dotColor: "#FF991F",
  },
]

export const PENDING_APPROVALS: IPendingApproval[] = [
  {
    type: "annual_audit.xlsx",
    description: "Từ: Janet Doe",
    from: "pending",
    status: "pending",
    icon: "description",
  },
  {
    type: "brand_hero_final.png",
    description: "Từ: Kevin Art",
    from: "pending",
    status: "pending",
    icon: "image",
  },
  {
    type: "contract_draft_v1.zip",
    description: "Từ: Legal Team",
    from: "pending",
    status: "pending",
    icon: "attach_file",
  },
]

export const RESOURCE_SNAPSHOTS: IResourceSnapshot[] = [
  { department: "Ban điều hành", used: 382.5, total: 500, status: "Tăng trưởng tốt", statusColor: "text-green-600" },
  { department: "Marketing", used: 255.0, total: 500, status: "Sắp chạm hạn mức", statusColor: "text-amber-500" },
  { department: "Kế toán", used: 127.5, total: 500, status: "Ổn định", statusColor: "text-gray-600" },
]

export const getSectionTitle = (section: string) => {
  if (section === "dashboard") {
    return "Tổng quan hệ thống"
  }
  if (section === "projects") {
    return "Danh mục dự án"
  }
  if (section === "organization") {
    return "Quản trị tổ chức"
  }
  if (section === "security") {
    return "Bảo mật & kiểm toán"
  }
  return "Quản trị"
}

export const getSectionDescription = (section: string) => {
  if (section === "dashboard") {
    return "Thông tin vận hành theo thời gian thực cho không gian làm việc của bạn."
  }
  if (section === "projects") {
    return "Quản lý dự án, quyền truy cập và mức sử dụng tài nguyên giữa các nhóm."
  }
  if (section === "organization") {
    return "Kiểm soát vai trò thành viên, phòng ban và phạm vi truy cập tại một nơi."
  }
  if (section === "security") {
    return "Theo dõi nhật ký, điều tra bất thường và thực thi chính sách bảo mật."
  }
  return ""
}

export const getProjectStatusLabel = (status: IProjectRecord["status"]) => {
  if (status === "Active") {
    return "Đang hoạt động"
  }
  if (status === "Planning") {
    return "Lên kế hoạch"
  }
  return "Lưu trữ"
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
