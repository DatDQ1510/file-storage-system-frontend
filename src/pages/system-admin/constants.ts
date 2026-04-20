import {
  Activity,
  Building2,
  CreditCard,
  UserCog,
} from "lucide-react"
import type {
  IPlanCard,
  ITenantProvisionPlan,
  ISystemNavGroup,
  ITenantRecord,
  TSystemSection,
  TTenantStatus,
} from "@/pages/system-admin/types"

export const SYSTEM_NAV_GROUPS: ISystemNavGroup[] = [
  {
    title: "Vận hành",
    items: [
      { label: "Tổng quan", icon: Activity, section: "dashboard" },
      { label: "Quản lý tenant", icon: Building2, section: "tenants" },
      { label: "Gói cước & thanh toán", icon: CreditCard, section: "billing" },
    ],
  },
  {
    title: "Thiết lập",
    items: [{ label: "Quản lý tài khoản", icon: UserCog, section: "account-management" }],
  },
]

export const TENANT_TABLE_DATA: ITenantRecord[] = [
  {
    businessName: "Vintech Solutions",
    nodeCode: "vn-south-east-1",
    status: "Active",
    plan: "Enterprise Plus",
    quotaUsed: "8.2 TB",
    quotaPercent: 82,
    createdDate: "24/10/2023",
    region: "Việt Nam",
    adminName: "Minh Nguyen",
    adminEmail: "minh.nguyen@vintech.vn",
  },
  {
    businessName: "Aether Media",
    nodeCode: "vn-central-2",
    status: "Trial",
    plan: "Professional",
    quotaUsed: "0.4 TB",
    quotaPercent: 8,
    createdDate: "12/01/2024",
    region: "Việt Nam",
    adminName: "Linh Tran",
    adminEmail: "linh.tran@aether.media",
  },
  {
    businessName: "Global Dynamics",
    nodeCode: "vn-north-1",
    status: "Suspended",
    plan: "Enterprise",
    quotaUsed: "5.1 TB",
    quotaPercent: 51,
    createdDate: "05/08/2022",
    region: "Việt Nam",
    adminName: "David Hoang",
    adminEmail: "david.hoang@globaldynamics.io",
  },
]

export const PLAN_CARDS: IPlanCard[] = [
  {
    tier: "Bậc 01",
    name: "Miễn phí",
    price: "$0",
    period: "/tháng",
    features: [
      "Tối đa 3 tenant đang hoạt động",
      "5GB dung lượng dùng chung",
      "Nhật ký kiểm toán cơ bản (7 ngày)",
      "Hỗ trợ subdomain tùy chỉnh",
    ],
    tenants: "1,248",
  },
  {
    tier: "Bậc 02",
    name: "Chuyên nghiệp",
    price: "$49",
    period: "/tháng",
    isHighlighted: true,
    features: [
      "Tối đa 25 tenant đang hoạt động",
      "100GB dung lượng dùng chung",
      "Subdomain tùy chỉnh & SSL",
      "Hỗ trợ tiêu chuẩn (24 giờ)",
    ],
    tenants: "856",
  },
  {
    tier: "Bậc 03",
    name: "Doanh nghiệp",
    price: "$199",
    period: "/tháng",
    features: [
      "Không giới hạn tenant",
      "1TB lưu trữ + tự động mở rộng",
      "Tích hợp SAML/SSO",
      "Hỗ trợ ưu tiên (1 giờ)",
    ],
    tenants: "142",
  },
]

export const TENANT_PROVISION_PLANS: ITenantProvisionPlan[] = [
  {
    name: "Basic",
    storageQuota: "100 GB",
    maxUsers: 20,
    description: "Gói khởi điểm cho đội nhóm nhỏ và các tenant triển khai thử nghiệm.",
  },
  {
    name: "Pro",
    storageQuota: "1 TB",
    maxUsers: 100,
    description: "Gói cân bằng cho tổ chức đang tăng trưởng, cần thông lượng ổn định.",
  },
  {
    name: "Enterprise",
    storageQuota: "10 TB",
    maxUsers: 500,
    description: "Gói toàn diện với tài nguyên chuyên biệt và chính sách quản trị nâng cao.",
  },
]

export const getSectionTitle = (section: TSystemSection) => {
  switch (section) {
    case "dashboard":
      return "Tổng quan"
    case "tenants":
      return "Quản lý tenant"
    case "billing":
      return "Quản lý gói cước"
    case "account-management":
      return "Quản lý tài khoản"
  }
}

export const getSectionDescription = (section: TSystemSection) => {
  if (section === "dashboard") {
    return "Theo dõi sức khỏe hệ thống, năng lực hạ tầng và các tín hiệu bảo mật trọng yếu trên toàn nền tảng."
  }

  if (section === "tenants") {
    return "Quản lý tenant doanh nghiệp, đăng ký workspace mới và theo dõi xu hướng sử dụng tài nguyên."
  }

  if (section === "account-management") {
    return "Cập nhật thông tin cá nhân, ảnh đại diện, mật khẩu và thiết lập bảo mật cho tài khoản quản trị."
  }

  return "Thiết lập gói dịch vụ, quy tắc thanh toán và các thông số kiểm soát doanh thu toàn hệ thống."
}

export const getTenantStatusClassName = (status: TTenantStatus) => {
  if (status === "Active") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (status === "Trial") {
    return "bg-blue-100 text-blue-700"
  }

  return "bg-red-100 text-red-700"
}

export const getTenantStatusLabel = (status: TTenantStatus) => {
  if (status === "Active") return "Đang hoạt động"
  if (status === "Trial") return "Dùng thử"
  return "Tạm ngưng"
}
