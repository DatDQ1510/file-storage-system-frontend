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
    title: "Operations",
    items: [
      { label: "Dashboard", icon: Activity, section: "dashboard" },
      { label: "Tenant Management", icon: Building2, section: "tenants" },
      { label: "Billing & Plans", icon: CreditCard, section: "billing" },
    ],
  },
  {
    title: "Settings",
    items: [{ label: "Account Management", icon: UserCog, section: "account-management" }],
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
    createdDate: "Oct 24, 2023",
    region: "Asia-Pacific (Singapore)",
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
    createdDate: "Jan 12, 2024",
    region: "Asia-Pacific (Tokyo)",
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
    createdDate: "Aug 05, 2022",
    region: "Europe (Frankfurt)",
    adminName: "David Hoang",
    adminEmail: "david.hoang@globaldynamics.io",
  },
]

export const PLAN_CARDS: IPlanCard[] = [
  {
    tier: "Tier 01",
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "Up to 3 active tenants",
      "5GB shared storage",
      "Basic audit logs (7 days)",
      "Custom subdomains",
    ],
    tenants: "1,248",
  },
  {
    tier: "Tier 02",
    name: "Professional",
    price: "$49",
    period: "/month",
    isHighlighted: true,
    features: [
      "Up to 25 active tenants",
      "100GB shared storage",
      "Custom subdomains & SSL",
      "Standard support (24h)",
    ],
    tenants: "856",
  },
  {
    tier: "Tier 03",
    name: "Enterprise",
    price: "$199",
    period: "/month",
    features: [
      "Unlimited tenants",
      "1TB storage + Auto-scale",
      "SAML/SSO integration",
      "Priority support (1h)",
    ],
    tenants: "142",
  },
]

export const TENANT_PROVISION_PLANS: ITenantProvisionPlan[] = [
  {
    name: "Basic",
    storageQuota: "100 GB",
    maxUsers: 20,
    description: "Entry plan for small internal teams and pilot tenant deployments.",
  },
  {
    name: "Pro",
    storageQuota: "1 TB",
    maxUsers: 100,
    description: "Balanced provisioning for growing organizations that need stronger throughput.",
  },
  {
    name: "Enterprise",
    storageQuota: "10 TB",
    maxUsers: 500,
    description: "Full-scale provisioning with dedicated capacity and advanced governance.",
  },
]

export const getSectionTitle = (section: TSystemSection) => {
  switch (section) {
    case "dashboard":
      return "Dashboard"
    case "tenants":
      return "Tenant Management"
    case "billing":
      return "Quản lý Gói cước"
    case "account-management":
      return "Account Management"
  }
}

export const getSectionDescription = (section: TSystemSection) => {
  if (section === "dashboard") {
    return "Monitor health, infrastructure throughput, and critical security signals across all regions."
  }

  if (section === "tenants") {
    return "Manage enterprise tenants, register new workspaces, and monitor workspace usage trends."
  }

  if (section === "account-management") {
    return "Update personal details, avatar, and password with a dedicated admin settings screen."
  }

  return "Define pricing tiers, billing safeguards, and platform-wide revenue control settings."
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
