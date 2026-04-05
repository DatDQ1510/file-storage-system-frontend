import { ChevronDown, ChevronRight, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TENANT_TABLE_DATA, getTenantStatusClassName } from "@/pages/system-admin/constants"
import { cn } from "@/lib/utils"

const TENANT_SUMMARY = [
  { label: "Total Enterprises", value: "1,248", foot: "+12% this month" },
  { label: "Active Trials", value: "84", foot: "pending conversion" },
  { label: "Infrastructure Load", value: "62%", foot: "stable across 12 nodes" },
  { label: "Revenue Run Rate", value: "$2.4M", foot: "annualized growth +24%" },
]

export const TenantsSection = () => {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TENANT_SUMMARY.map((summary) => (
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
              />
            </label>
            <Button size="sm" variant="outline" className="border-slate-300 text-slate-600">
              <Filter className="h-4 w-4" />
              Filter
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3">Business Name</th>
                <th className="py-3">Status</th>
                <th className="py-3">Plan</th>
                <th className="py-3">Quota Used</th>
                <th className="py-3">Created Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {TENANT_TABLE_DATA.map((tenant) => (
                <tr key={tenant.businessName} className="border-b border-slate-100 last:border-none">
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">{tenant.businessName}</p>
                    <p className="text-xs text-slate-500">{tenant.nodeCode}</p>
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
    </div>
  )
}
