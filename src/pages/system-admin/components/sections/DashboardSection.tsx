import { Activity, Gauge, ShieldAlert, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DASHBOARD_SUMMARY = [
  {
    label: "System Health",
    value: "99.9%",
    note: "Optimal across all regions",
    icon: Gauge,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Active Tenants",
    value: "1,248",
    note: "+12 this week",
    icon: TrendingUp,
    tone: "bg-blue-100 text-blue-700",
  },
  {
    label: "Throughput",
    value: "42.8 GB/s",
    note: "Live traffic across clusters",
    icon: Activity,
    tone: "bg-cyan-100 text-cyan-700",
  },
  {
    label: "Threat Defense",
    value: "2,491",
    note: "Blocked IP sources",
    icon: ShieldAlert,
    tone: "bg-slate-900 text-slate-100",
  },
]

export const DashboardSection = () => {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_SUMMARY.map((item) => (
          <Card
            key={item.label}
            className={cn(
              "border-slate-200 bg-white/90 shadow-sm",
              item.label === "Threat Defense" && "relative overflow-hidden border-transparent bg-slate-900 text-slate-100"
            )}
          >
            {item.label === "Threat Defense" && (
              <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-cyan-600/30 blur-2xl" />
            )}
            <CardHeader className="pb-1">
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", item.label === "Threat Defense" ? "text-cyan-200/90" : "text-slate-500")}>{item.label}</p>
              <CardTitle className={cn("text-4xl font-bold", item.label === "Threat Defense" ? "text-white" : "text-slate-900")}>{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className={cn("text-xs", item.label === "Threat Defense" ? "text-slate-300" : "text-slate-500")}>{item.note}</p>
              <item.icon className={cn("h-4 w-4", item.label === "Threat Defense" ? "text-cyan-200" : item.tone.split(" ")[1])} />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Infrastructure Nodes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Redis Clusters", value: "4 nodes active", usage: 84, color: "bg-rose-500" },
              { label: "RabbitMQ Queues", value: "12,402 msg/sec", usage: 88, color: "bg-amber-500" },
              { label: "MinIO S3 Nodes", value: "1.2 PB capacity", usage: 42, color: "bg-blue-500" },
            ].map((node) => (
              <div key={node.label} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{node.label}</p>
                <p className="text-xs text-slate-500">{node.value}</p>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className={cn("h-2 rounded-full", node.color)} style={{ width: `${node.usage}%` }} />
                </div>
                <p className="text-right text-xs font-semibold text-slate-500">{node.usage}%</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Cluster Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { region: "US-East", percent: 85, color: "bg-blue-600" },
              { region: "EU-West", percent: 42, color: "bg-purple-500" },
              { region: "AP-South", percent: 68, color: "bg-emerald-500" },
            ].map((cluster) => (
              <div key={cluster.region} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>{cluster.region}</span>
                  <span>{cluster.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className={cn("h-2 rounded-full", cluster.color)} style={{ width: `${cluster.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
