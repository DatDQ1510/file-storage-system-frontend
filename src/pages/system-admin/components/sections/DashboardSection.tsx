import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarClock,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DASHBOARD_SUMMARY = [
  {
    label: "Total Tenants",
    value: "1,248",
    note: "+34 this month",
    trend: "+2.8%",
    icon: Building2,
    tone: "text-blue-700 bg-blue-100",
  },
  {
    label: "Active Subscriptions",
    value: "1,102",
    note: "88.3% tenant base",
    trend: "+1.6%",
    icon: CreditCard,
    tone: "text-emerald-700 bg-emerald-100",
  },
  {
    label: "Trial Conversion",
    value: "31.6%",
    note: "Last 30 days",
    trend: "+4.2%",
    icon: TrendingUp,
    tone: "text-cyan-700 bg-cyan-100",
  },
  {
    label: "MRR",
    value: "$482K",
    note: "Net monthly recurring revenue",
    trend: "+8.4%",
    icon: BarChart3,
    tone: "text-amber-700 bg-amber-100",
  },
]

const PLAN_DISTRIBUTION = [
  { label: "Basic", tenants: 468, percent: 38, color: "bg-slate-500" },
  { label: "Pro", tenants: 592, percent: 47, color: "bg-blue-500" },
  { label: "Enterprise", tenants: 188, percent: 15, color: "bg-emerald-500" },
]

const TENANT_LIFECYCLE = [
  {
    stage: "Trial Started",
    count: "312",
    percent: 100,
    color: "bg-slate-500",
    note: "All new tenant signups",
  },
  {
    stage: "Activated",
    count: "225",
    percent: 72,
    color: "bg-blue-600",
    note: "Setup password completed",
  },
  {
    stage: "Paid Conversion",
    count: "99",
    percent: 31.6,
    color: "bg-emerald-500",
    note: "Converted from trial",
  },
]

const EXECUTIVE_ALERTS = [
  {
    title: "Renewals in next 7 days",
    value: "48 tenants",
    description: "Focus account team on high-MRR renewals to reduce churn risk.",
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
  {
    title: "Tenants near user limit",
    value: "27 tenants",
    description: "Strong upsell candidates for plan upgrade campaigns.",
    tone: "border-blue-200 bg-blue-50 text-blue-900",
  },
  {
    title: "Plan downgrade signals",
    value: "12 tenants",
    description: "Usage dropped below 40% for two consecutive billing cycles.",
    tone: "border-rose-200 bg-rose-50 text-rose-900",
  },
]

export const DashboardSection = () => {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <CardHeader className="pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
              Portfolio Overview
            </p>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Tenant & Subscription Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="max-w-2xl text-sm text-slate-200">
              Revenue growth remains stable with strong Pro plan adoption. Immediate
              focus should be trial-to-paid acceleration and enterprise renewal
              protection.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">ARR Projection</p>
                <p className="mt-1 text-xl font-semibold">$5.78M</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Net Revenue Retention</p>
                <p className="mt-1 text-xl font-semibold">116%</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Avg. Contract Value</p>
                <p className="mt-1 text-xl font-semibold">$438</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-slate-900">This Quarter Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Plan Upgrade Campaign", owner: "Growth Team", due: "Apr 18" },
              { label: "Enterprise Renewal Review", owner: "Account Team", due: "Apr 22" },
              { label: "Trial Onboarding Optimization", owner: "Product Team", due: "Apr 29" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.owner}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {item.due}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_SUMMARY.map((item) => (
          <Card key={item.label} className="border-slate-200 bg-white/95 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{item.note}</p>
                <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", item.tone)}>
                  {item.trend}
                </span>
              </div>
              <div className="flex items-center justify-end">
                <item.icon className="h-4 w-4 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Tenant Distribution by Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="flex h-full w-full">
                {PLAN_DISTRIBUTION.map((plan) => (
                  <div key={plan.label} className={cn("h-full", plan.color)} style={{ width: `${plan.percent}%` }} />
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {PLAN_DISTRIBUTION.map((plan) => (
                <div key={plan.label} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{plan.label}</p>
                    <span className="text-xs font-semibold text-slate-500">{plan.percent}%</span>
                  </div>
                  <p className="text-xs text-slate-500">{plan.tenants.toLocaleString("en-US")} tenants</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Tenant Lifecycle Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TENANT_LIFECYCLE.map((stage) => (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>{stage.stage}</span>
                  <span>{stage.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className={cn("h-2 rounded-full", stage.color)} style={{ width: `${stage.percent}%` }} />
                </div>
                <p className="text-xs text-slate-500">{stage.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Revenue & Tenant Momentum</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "New Tenant Acquisition",
                value: "82",
                note: "This month",
                icon: Users,
                tone: "bg-blue-100 text-blue-700",
              },
              {
                title: "Expansion MRR",
                value: "$96K",
                note: "Upsell + add-ons",
                icon: ArrowUpRight,
                tone: "bg-emerald-100 text-emerald-700",
              },
              {
                title: "Churned Tenants",
                value: "11",
                note: "0.9% monthly",
                icon: TrendingUp,
                tone: "bg-amber-100 text-amber-700",
              },
              {
                title: "Retention Health",
                value: "Strong",
                note: "Enterprise stable",
                icon: ShieldCheck,
                tone: "bg-cyan-100 text-cyan-700",
              },
            ].map((metric) => (
              <div key={metric.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{metric.title}</p>
                  <span className={cn("rounded-full p-1.5", metric.tone)}>
                    <metric.icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-xs text-slate-500">{metric.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Executive Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {EXECUTIVE_ALERTS.map((alert) => (
              <div key={alert.title} className={cn("rounded-xl border px-3 py-3", alert.tone)}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <span className="text-xs font-bold uppercase tracking-wide">{alert.value}</span>
                </div>
                <p className="mt-1 text-xs opacity-90">{alert.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
