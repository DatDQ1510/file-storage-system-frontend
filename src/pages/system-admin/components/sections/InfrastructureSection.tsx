import { Activity, AlertTriangle, CheckCircle2, Server } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TSystemSection } from "@/pages/system-admin/types"

interface IInfrastructureSectionProps {
  activeSection: TSystemSection
}

const INFRA_SECTION_CONTENT: Record<
  Exclude<TSystemSection, "dashboard" | "tenants" | "quota" | "billing">,
  {
    title: string
    primaryMetricLabel: string
    primaryMetricValue: string
    stats: Array<{ label: string; value: string; tone: "ok" | "warn" | "critical" }>
  }
> = {
  "redis-status": {
    title: "Redis Cluster Health",
    primaryMetricLabel: "Average Memory Usage",
    primaryMetricValue: "64%",
    stats: [
      { label: "Primary Nodes", value: "12", tone: "ok" },
      { label: "Replica Lag", value: "43 ms", tone: "warn" },
      { label: "Failover Alerts", value: "0", tone: "ok" },
    ],
  },
  "rabbitmq-queue": {
    title: "RabbitMQ Queue Overview",
    primaryMetricLabel: "Current Queue Depth",
    primaryMetricValue: "12,402",
    stats: [
      { label: "Messages/sec", value: "4,280", tone: "ok" },
      { label: "Retry Queue", value: "318", tone: "warn" },
      { label: "Dead Letter", value: "11", tone: "critical" },
    ],
  },
  "storage-nodes": {
    title: "Storage Node Fleet",
    primaryMetricLabel: "Total Capacity",
    primaryMetricValue: "1.2 PB",
    stats: [
      { label: "Healthy Nodes", value: "42", tone: "ok" },
      { label: "Degraded Nodes", value: "2", tone: "warn" },
      { label: "Read Latency p95", value: "41 ms", tone: "ok" },
    ],
  },
  "global-audit-logs": {
    title: "Global Audit Activity",
    primaryMetricLabel: "Events (24h)",
    primaryMetricValue: "8,912",
    stats: [
      { label: "Config Changes", value: "214", tone: "warn" },
      { label: "Security Actions", value: "58", tone: "ok" },
      { label: "Failed Attempts", value: "7", tone: "critical" },
    ],
  },
  "blocked-ips": {
    title: "Blocked IP Intelligence",
    primaryMetricLabel: "Blocked Sources",
    primaryMetricValue: "2,491",
    stats: [
      { label: "New Today", value: "43", tone: "warn" },
      { label: "Auto-Expired", value: "21", tone: "ok" },
      { label: "High-Risk", value: "9", tone: "critical" },
    ],
  },
}

const toneClassMap = {
  ok: "text-emerald-700 bg-emerald-100",
  warn: "text-amber-700 bg-amber-100",
  critical: "text-red-700 bg-red-100",
}

const sectionSummaryCards = (title: string, primaryMetricLabel: string, primaryMetricValue: string, stats: Array<{ label: string; value: string; tone: "ok" | "warn" | "critical" }>) => [
  { label: title, value: primaryMetricValue, foot: primaryMetricLabel },
  ...stats.map((item) => ({ label: item.label, value: item.value, foot: item.tone === "ok" ? "Stable" : item.tone === "warn" ? "Warning" : "Critical" })),
]

export const InfrastructureSection = ({ activeSection }: IInfrastructureSectionProps) => {
  const section = INFRA_SECTION_CONTENT[activeSection as keyof typeof INFRA_SECTION_CONTENT]

  if (!section) {
    return null
  }

  const summaryCards = sectionSummaryCards(section.title, section.primaryMetricLabel, section.primaryMetricValue, section.stats)

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Card
            key={`${card.label}-${index}`}
            className={cn(
              "border-slate-200 bg-white/90 shadow-sm",
              index === 0 && "ring-1 ring-blue-100"
            )}
          >
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{card.foot}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">Infrastructure Signals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Updated 8s ago</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{section.primaryMetricValue}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <Activity className="h-3.5 w-3.5 text-blue-600" />
              {section.primaryMetricLabel}
            </div>
          </div>

          {section.stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              <span className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${toneClassMap[item.tone]}`}>
                {item.tone === "ok" ? "Stable" : item.tone === "warn" ? "Warning" : "Critical"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Signals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              icon: CheckCircle2,
              tone: "text-emerald-600",
              message: "Auto-remediation completed successfully on edge node vn-01.",
            },
            {
              icon: AlertTriangle,
              tone: "text-amber-600",
              message: "Transient latency spike detected in AP-South between 14:02 - 14:06.",
            },
            {
              icon: Server,
              tone: "text-blue-600",
              message: "Capacity rebalance job moved 418GB between storage shards.",
            },
          ].map((signal, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <signal.icon className={`mt-0.5 h-4 w-4 ${signal.tone}`} />
              <p className="text-sm text-slate-700">{signal.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
