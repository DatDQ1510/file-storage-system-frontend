import {
  ArrowUpRight,
  CalendarClock,
  HardDrive,
  Server,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const QUOTA_METRICS = [
  { label: "Cluster Capacity", value: "9.8 PB", note: "Across 4 regions" },
  { label: "Allocated", value: "6.4 PB", note: "65% utilization" },
  { label: "Reserved Buffer", value: "2.1 PB", note: "For burst workloads" },
  { label: "Over-quota Tenants", value: "18", note: "Need review this week" },
]

const TENANT_QUOTA_MATRIX = [
  {
    tenant: "Nexus Analytics Corp",
    plan: "Enterprise Tier",
    region: "Asia-Pacific (Tokyo)",
    cpu: { used: 32, total: 128 },
    ram: { used: 128, total: 512 },
    storage: { used: 2.0, total: 10.0 },
    status: "Healthy",
  },
  {
    tenant: "Aether Media",
    plan: "Professional",
    region: "Asia-Pacific (Singapore)",
    cpu: { used: 21, total: 32 },
    ram: { used: 54, total: 128 },
    storage: { used: 0.7, total: 2.0 },
    status: "Watch",
  },
  {
    tenant: "Global Dynamics",
    plan: "Enterprise Plus",
    region: "Europe (Frankfurt)",
    cpu: { used: 108, total: 128 },
    ram: { used: 476, total: 512 },
    storage: { used: 9.3, total: 10.0 },
    status: "Critical",
  },
]

const ALLOCATION_POLICIES = [
  {
    title: "Auto Scale CPU",
    description: "Increase vCPU allocation by 20% when utilization > 85% for 15 minutes",
    enabled: true,
  },
  {
    title: "Storage Safety Buffer",
    description: "Reserve 10% SSD pool for urgent failover reallocation",
    enabled: true,
  },
  {
    title: "Hard Quota Lock",
    description: "Block write operations after 105% temporary burst usage",
    enabled: false,
  },
]

const ALLOCATION_EVENTS = [
  {
    title: "Nexus Analytics Corp quota expanded",
    detail: "Storage: 6 TB -> 10 TB, CPU: 64 -> 128 vCPU",
    actor: "quota_admin",
    time: "12 minutes ago",
    status: "Completed",
  },
  {
    title: "Global Dynamics hit emergency threshold",
    detail: "RAM usage reached 93%, watch mode enabled",
    actor: "capacity_guard",
    time: "47 minutes ago",
    status: "Investigating",
  },
  {
    title: "Quarterly quota policy rollout",
    detail: "Applied to 214 enterprise tenants in EU + APAC",
    actor: "system_bot",
    time: "2 hours ago",
    status: "Completed",
  },
]

export const QuotaSection = () => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quota Allocation Control</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage capacity distribution, enforce quota policies, and monitor high-pressure tenants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="border-slate-300 bg-white">
            <SlidersHorizontal className="h-4 w-4" />
            Rebalance Quota
          </Button>
          <Button size="sm" className="bg-blue-700 text-white hover:bg-blue-800">
            <ArrowUpRight className="h-4 w-4" />
            Create Allocation Policy
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {QUOTA_METRICS.map((metric) => (
          <Card key={metric.label} className="border-slate-200 bg-white/90 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{metric.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Global Capacity Pool</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Server className="h-5 w-5 text-blue-700" />
                <p className="text-sm font-semibold">Compute Pool</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">4,096 vCPU</p>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: "71%" }} />
              </div>
              <p className="text-xs text-slate-500">2,918 allocated</p>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-700">
                <HardDrive className="h-5 w-5 text-blue-700" />
                <p className="text-sm font-semibold">Storage Pool</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">9.8 PB</p>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-cyan-600" style={{ width: "65%" }} />
              </div>
              <p className="text-xs text-slate-500">6.4 PB allocated</p>
            </div>

            <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">Quota Guardrail Status</p>
              </div>
              <p className="mt-1 text-xs text-emerald-700">All hard limits are enforced. 18 tenants currently in watch mode.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Allocation Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ALLOCATION_POLICIES.map((policy) => (
              <div key={policy.title} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{policy.title}</p>
                  <p className="text-xs text-slate-500">{policy.description}</p>
                </div>
                <button
                  className={cn(
                    "h-6 w-11 rounded-full p-0.5 transition",
                    policy.enabled ? "bg-blue-600" : "bg-slate-300"
                  )}
                  type="button"
                >
                  <span
                    className={cn(
                      "block h-5 w-5 rounded-full bg-white transition",
                      policy.enabled ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">Tenant Quota Matrix</CardTitle>
            <Button size="sm" variant="outline" className="border-slate-300">Export Matrix</Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  <th className="py-3">Tenant</th>
                  <th className="py-3">CPU</th>
                  <th className="py-3">RAM</th>
                  <th className="py-3">Storage</th>
                  <th className="py-3">Region</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {TENANT_QUOTA_MATRIX.map((tenant) => (
                  <tr key={tenant.tenant} className="border-b border-slate-100 last:border-none">
                    <td className="py-4">
                      <p className="font-semibold text-slate-900">{tenant.tenant}</p>
                      <p className="text-xs text-slate-500">{tenant.plan}</p>
                    </td>
                    <td className="text-slate-700">{tenant.cpu.used} / {tenant.cpu.total} vCPU</td>
                    <td className="text-slate-700">{tenant.ram.used} / {tenant.ram.total} GB</td>
                    <td className="text-slate-700">{tenant.storage.used.toFixed(1)} / {tenant.storage.total.toFixed(1)} TB</td>
                    <td className="text-slate-700">{tenant.region}</td>
                    <td>
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
                          tenant.status === "Healthy" && "bg-emerald-100 text-emerald-700",
                          tenant.status === "Watch" && "bg-amber-100 text-amber-700",
                          tenant.status === "Critical" && "bg-red-100 text-red-700"
                        )}
                      >
                        {tenant.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Recent Allocation Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ALLOCATION_EVENTS.map((event) => (
              <div key={event.title} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                <p className="text-xs text-slate-600">{event.detail}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{event.actor}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {event.time}
                  </span>
                </div>
                <span
                  className={cn(
                    "mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold",
                    event.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
