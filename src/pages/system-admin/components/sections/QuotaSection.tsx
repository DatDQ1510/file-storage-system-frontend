import { Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const QUOTA_SUMMARY = [
  { label: "CPU Used", value: "32 vCPUs", note: "26% of total capacity" },
  { label: "RAM Used", value: "128 GB", note: "25% of total capacity" },
  { label: "Storage Used", value: "2 TB", note: "20% of total capacity" },
  { label: "Uptime", value: "99.998%", note: "Operational in 3 regions" },
]

export const QuotaSection = () => {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {QUOTA_SUMMARY.map((summary) => (
          <Card key={summary.label} className="border-slate-200 bg-white/90 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{summary.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{summary.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{summary.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardContent className="grid gap-4 pt-4 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-100 text-blue-700">
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">Nexus Analytics Corp</p>
                  <p className="text-sm text-slate-600">Enterprise Tier Plan</p>
                </div>
              </div>
              <div className="inline-flex rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Active</div>
              <div className="grid gap-3 border-t border-slate-200 pt-3 text-sm text-slate-600 sm:grid-cols-2">
                <p>
                  Tenant ID
                  <span className="block font-semibold text-slate-900">TEN-294-XZ01</span>
                </p>
                <p>
                  Region
                  <span className="block font-semibold text-slate-900">Asia-Pacific (Tokyo)</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-transparent bg-blue-700 p-4 text-white shadow-md shadow-blue-900/25">
              <p className="text-[11px] uppercase tracking-[0.2em] text-blue-100">Current Uptime</p>
              <p className="mt-1 text-5xl font-semibold">99.998%</p>
              <p className="mt-2 text-xs text-blue-100">Operational in 3 regions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { resource: "CPU Quota", current: "32 vCPUs", from: "1 vCPU", to: "128 vCPUs", percent: 26 },
              { resource: "RAM Quota", current: "128 GB", from: "4 GB", to: "512 GB", percent: 25 },
              { resource: "Storage SSD", current: "2 TB", from: "100 GB", to: "10 TB", percent: 20 },
            ].map((item) => (
              <div key={item.resource} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>{item.resource}</span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700">{item.current}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${item.percent}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{item.from}</span>
                  <span>{item.to}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-900">Allocation History</CardTitle>
          <Button variant="ghost" className="text-blue-700">View All</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { date: "24 Oct, 2023", change: "CPU: 16 -> 32", actor: "admin_minh", status: "Completed" },
            { date: "18 Oct, 2023", change: "RAM: 64 -> 128", actor: "system_bot", status: "Completed" },
            { date: "02 Oct, 2023", change: "New allocation", actor: "super_admin", status: "Completed" },
          ].map((log) => (
            <div
              key={`${log.date}-${log.actor}`}
              className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
            >
              <div>
                <p className="font-semibold text-slate-900">{log.date}</p>
                <p className="text-xs text-slate-500">14:32 PM</p>
              </div>
              <p className="font-semibold text-blue-700">{log.change}</p>
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {log.actor.slice(0, 2).toUpperCase()}
                </div>
                <span>{log.actor}</span>
              </div>
              <span className="justify-self-start rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 sm:justify-self-end">
                {log.status}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
