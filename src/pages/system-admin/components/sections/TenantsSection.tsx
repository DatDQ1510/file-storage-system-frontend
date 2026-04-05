import { useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { ChevronDown, ChevronRight, Filter, Plus, Search, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TENANT_TABLE_DATA,
  getTenantStatusClassName,
} from "@/pages/system-admin/constants"
import type { ITenantRecord, TTenantStatus } from "@/pages/system-admin/types"
import { cn } from "@/lib/utils"

interface ITenantsSectionProps {
  isRegisterTenantOpen: boolean
  onOpenRegisterTenant: () => void
  onCloseRegisterTenant: () => void
}

interface IRegisterTenantFormState {
  businessName: string
  nodeCode: string
  plan: string
  region: string
  adminName: string
  adminEmail: string
}

const TENANT_PLAN_OPTIONS = ["Free", "Professional", "Enterprise", "Enterprise Plus", "Custom"]
const TENANT_REGION_OPTIONS = [
  "Asia-Pacific (Tokyo)",
  "Asia-Pacific (Singapore)",
  "Europe (Frankfurt)",
  "US-East (Virginia)",
]

const INITIAL_FORM_STATE: IRegisterTenantFormState = {
  businessName: "",
  nodeCode: "",
  plan: "Professional",
  region: "Asia-Pacific (Tokyo)",
  adminName: "",
  adminEmail: "",
}

const formatToday = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date())

export const TenantsSection = ({
  isRegisterTenantOpen,
  onOpenRegisterTenant,
  onCloseRegisterTenant,
}: ITenantsSectionProps) => {
  const [tenants, setTenants] = useState<ITenantRecord[]>(TENANT_TABLE_DATA)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<TTenantStatus | "all">("all")
  const [formState, setFormState] = useState<IRegisterTenantFormState>(INITIAL_FORM_STATE)

  const summaryCards = useMemo(() => {
    const totalEnterprises = tenants.length
    const activeTrials = tenants.filter((tenant) => tenant.status === "Trial").length
    const infrastructureLoad = Math.round(
      (tenants.reduce((sum, tenant) => sum + tenant.quotaPercent, 0) / (tenants.length * 100)) * 100
    )
    const revenueRunRate = `$${(tenants.filter((tenant) => tenant.status === "Active").length * 0.8 + 1.6).toFixed(1)}M`

    return [
      { label: "Total Enterprises", value: totalEnterprises.toLocaleString("en-US"), foot: "+12% this month" },
      { label: "Active Trials", value: activeTrials.toString(), foot: "pending conversion" },
      { label: "Infrastructure Load", value: `${Math.min(infrastructureLoad, 100)}%`, foot: "stable across clusters" },
      { label: "Revenue Run Rate", value: revenueRunRate, foot: "annualized growth +24%" },
    ]
  }, [tenants])

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const normalizedSearch = searchTerm.trim().toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 ||
        tenant.businessName.toLowerCase().includes(normalizedSearch) ||
        tenant.nodeCode.toLowerCase().includes(normalizedSearch) ||
        tenant.adminName.toLowerCase().includes(normalizedSearch) ||
        tenant.adminEmail.toLowerCase().includes(normalizedSearch)
      const matchesStatus = selectedStatus === "all" || tenant.status === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [searchTerm, selectedStatus, tenants])

  const handleInputChange = (field: keyof IRegisterTenantFormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.value
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleRegisterTenant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const businessName = formState.businessName.trim()
    const nodeCode = formState.nodeCode.trim()
    const adminName = formState.adminName.trim()
    const adminEmail = formState.adminEmail.trim()

    if (!businessName || !nodeCode || !adminName || !adminEmail) {
      toast.error("Please fill in all required tenant details.")
      return
    }

    if (!adminEmail.includes("@")) {
      toast.error("Admin email is not valid.")
      return
    }

    const newTenant: ITenantRecord = {
      businessName,
      nodeCode,
      status: "Trial",
      plan: formState.plan,
      quotaUsed: "0 GB",
      quotaPercent: 0,
      createdDate: formatToday(),
      region: formState.region,
      adminName,
      adminEmail,
    }

    setTenants((current) => [newTenant, ...current])
    setFormState(INITIAL_FORM_STATE)
    onCloseRegisterTenant()
    toast.success(`Tenant ${businessName} registered successfully.`)
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((summary) => (
          <Card key={summary.label} className="border-slate-200 bg-white/90 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{summary.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{summary.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{summary.foot}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Active Enterprise Tenants</CardTitle>
            <p className="mt-1 text-xs text-slate-500">Monitor tenant status, plan usage, and onboarding date in one table.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search tenants..."
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
              onChange={(event) => setSelectedStatus(event.target.value as TTenantStatus | "all")}
              value={selectedStatus}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Suspended">Suspended</option>
            </select>

            <Button size="sm" variant="outline" className="border-slate-300 text-slate-600" onClick={onOpenRegisterTenant}>
              <Plus className="h-4 w-4" />
              Register New Tenant
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="border-slate-300 text-slate-600"
              onClick={() => {
                setSearchTerm("")
                setSelectedStatus("all")
              }}
            >
              <Filter className="h-4 w-4" />
              Reset
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3">Business Name</th>
                <th className="py-3">Admin Contact</th>
                <th className="py-3">Status</th>
                <th className="py-3">Plan</th>
                <th className="py-3">Quota Used</th>
                <th className="py-3">Region</th>
                <th className="py-3">Created Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.businessName} className="border-b border-slate-100 last:border-none">
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">{tenant.businessName}</p>
                    <p className="text-xs text-slate-500">{tenant.nodeCode}</p>
                  </td>
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">{tenant.adminName}</p>
                    <p className="text-xs text-slate-500">{tenant.adminEmail}</p>
                  </td>
                  <td>
                    <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-semibold", getTenantStatusClassName(tenant.status))}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="text-slate-700">{tenant.plan}</td>
                  <td>
                    <div className="w-32">
                      <p className="mb-1 text-xs font-semibold text-slate-700">{tenant.quotaUsed}</p>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${tenant.quotaPercent}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-700">{tenant.region}</td>
                  <td className="text-slate-700">{tenant.createdDate}</td>
                  <td className="text-right">
                    <Button size="icon-sm" variant="ghost" className="text-slate-500">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isRegisterTenantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            aria-label="Close register tenant modal"
            className="absolute inset-0 bg-slate-950/40"
            onClick={onCloseRegisterTenant}
            type="button"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Register New Tenant</h3>
                <p className="mt-1 text-sm text-slate-500">Create a tenant workspace, assign an initial plan, and set the primary admin contact.</p>
              </div>
              <button className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" onClick={onCloseRegisterTenant} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="grid gap-4 px-6 py-5 md:grid-cols-2" onSubmit={handleRegisterTenant}>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Business Name</span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                  placeholder="e.g. Nova Logistics"
                  value={formState.businessName}
                  onChange={handleInputChange("businessName")}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Node Code</span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                  placeholder="e.g. vn-south-east-3"
                  value={formState.nodeCode}
                  onChange={handleInputChange("nodeCode")}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Admin Name</span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                  placeholder="Primary admin name"
                  value={formState.adminName}
                  onChange={handleInputChange("adminName")}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Admin Email</span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                  placeholder="admin@company.com"
                  type="email"
                  value={formState.adminEmail}
                  onChange={handleInputChange("adminEmail")}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Plan</span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                  value={formState.plan}
                  onChange={handleInputChange("plan")}
                >
                  {TENANT_PLAN_OPTIONS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Region</span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                  value={formState.region}
                  onChange={handleInputChange("region")}
                >
                  {TENANT_REGION_OPTIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>

              <div className="md:col-span-2 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
                The tenant will be created with status Trial, zero quota usage, and the selected admin will receive the invite email.
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <Button type="button" variant="ghost" className="text-slate-600" onClick={onCloseRegisterTenant}>
                  Cancel
                </Button>
                <Button className="bg-blue-700 text-white hover:bg-blue-800" type="submit">
                  Register Tenant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
