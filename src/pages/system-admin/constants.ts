import {
  Activity,
  Building2,
  CreditCard,
  Database,
  HardDrive,
  Network,
  Shield,
  ShieldBan,
  SlidersHorizontal,
} from "lucide-react"
import type {
  IPlanCard,
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
      { label: "Quota Allocation", icon: SlidersHorizontal, section: "quota" },
      { label: "Billing & Plans", icon: CreditCard, section: "billing" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { label: "Redis Status", icon: Database, section: "redis-status" },
      { label: "RabbitMQ Queue", icon: Network, section: "rabbitmq-queue" },
      { label: "Storage Nodes", icon: HardDrive, section: "storage-nodes" },
      { label: "Global Audit Logs", icon: Shield, section: "global-audit-logs" },
      { label: "Blocked IPs", icon: ShieldBan, section: "blocked-ips" },
    ],
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

export const getSectionTitle = (section: TSystemSection) => {
  switch (section) {
    case "dashboard":
      return "Dashboard"
    case "tenants":
      return "Tenant Management"
    case "quota":
      return "Cấp phát Quota"
    case "billing":
      return "Quản lý Gói cước"
    case "redis-status":
      return "Trạng thái Redis"
    case "rabbitmq-queue":
      return "Hàng đợi RabbitMQ"
    case "storage-nodes":
      return "Storage Nodes"
    case "global-audit-logs":
      return "Global Audit Logs"
    case "blocked-ips":
      return "Blocked IPs"
  }
}

export const getSectionDescription = (section: TSystemSection) => {
  if (section === "dashboard") {
    return "Monitor health, infrastructure throughput, and critical security signals across all regions."
  }

  if (section === "tenants") {
    return "Manage enterprise tenants, register new workspaces, and inspect quota utilization trends."
  }

  if (section === "quota") {
    return "Configure CPU, RAM, and SSD allocation boundaries for high-performance tenant environments."
  }

  if (section === "redis-status") {
    return "Track Redis cluster memory pressure, replication lag, and failover readiness by region."
  }

  if (section === "rabbitmq-queue") {
    return "Observe queue depth, processing throughput, and retry spikes to prevent message backlogs."
  }

  if (section === "storage-nodes") {
    return "Inspect storage node health, disk usage, and latency distribution across object clusters."
  }

  if (section === "global-audit-logs") {
    return "Review system-wide audit trails for configuration changes and security-sensitive actions."
  }

  if (section === "blocked-ips") {
    return "Manage denied IP addresses and investigate traffic anomalies or repeated abuse patterns."
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
