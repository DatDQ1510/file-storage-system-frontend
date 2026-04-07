import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { ChevronDown, ChevronRight, Filter, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTenantStatusClassName } from "@/pages/system-admin/constants"
import { TenantRegisterModal } from "@/pages/system-admin/components/sections/tenant/TenantRegisterModal"
import { loadTenantRecords, registerTenant } from "@/pages/system-admin/services/tenant-service"
import type { ITenantCreateInput, ITenantRecord, TTenantStatus } from "@/pages/system-admin/types"
import { cn } from "@/lib/utils"

interface ITenantsSectionProps {
  isRegisterTenantOpen: boolean
  onOpenRegisterTenant: () => void
  onCloseRegisterTenant: () => void
}

interface IRegisterTenantFormState {
  businessName: string
  nodeCode: string
  status: TTenantStatus
  extraStorageSize: string
  storageUnit: "GB" | "TB"
  plan: string
  region: string
  adminName: string
  adminEmail: string
}

const INITIAL_FORM_STATE: IRegisterTenantFormState = {
  businessName: "",
  nodeCode: "",
  status: "Trial",
  extraStorageSize: "",
  storageUnit: "GB",
  plan: "Professional",
  region: "Asia-Pacific (Tokyo)",
  adminName: "",
  adminEmail: "",
}

export const TenantsSection = ({
  isRegisterTenantOpen,
  onCloseRegisterTenant,
}: ITenantsSectionProps) => {
  const [tenants, setTenants] = useState<ITenantRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<TTenantStatus | "all">("all")
  const [formState, setFormState] = useState<IRegisterTenantFormState>(INITIAL_FORM_STATE)

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const result = await loadTenantRecords()
        setTenants(result)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load tenant list")
      }
    }

    void loadTenants()
  }, [])

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

  const handleInputChange = <K extends keyof IRegisterTenantFormState>(field: K) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.value as IRegisterTenantFormState[K]
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleRegisterTenant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const businessName = formState.businessName.trim()
    const nodeCode = formState.nodeCode.trim()
    const adminName = formState.adminName.trim()
    const adminEmail = formState.adminEmail.trim()

    if (!businessName || !nodeCode || !adminName || !adminEmail || !formState.extraStorageSize.trim()) {
      toast.error("Please fill in all required tenant details.")
      return
    }

    if (!adminEmail.includes("@")) {
      toast.error("Admin email is not valid.")
      return
    }

    const storageNumber = Number(formState.extraStorageSize)
    if (Number.isNaN(storageNumber) || storageNumber < 0) {
      toast.error("Please enter a valid storage amount.")
      return
    }

    const tenantInput: ITenantCreateInput = {
      businessName,
      nodeCode,
      status: formState.status,
      plan: formState.plan,
      extraStorageSize: storageNumber,
      storageUnit: formState.storageUnit,
      region: formState.region,
      adminName,
      adminEmail,
    }

    try {
      const newTenant = await registerTenant(tenantInput)
      setTenants((current) => [newTenant, ...current])
      setFormState(INITIAL_FORM_STATE)
      onCloseRegisterTenant()
      toast.success(`Tenant ${businessName} registered successfully.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register tenant")
    }
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

      <TenantRegisterModal
        isOpen={isRegisterTenantOpen}
        formState={formState}
        onClose={onCloseRegisterTenant}
        onChange={handleInputChange}
        onSubmit={handleRegisterTenant}
      />
    </div>
  )
}
