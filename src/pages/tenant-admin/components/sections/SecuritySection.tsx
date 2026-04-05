import { Activity, AlertTriangle, CheckCircle2, Lock, Radar, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const SECURITY_SUMMARY = [
  { label: "Threat Events (24h)", value: "42", foot: "all mitigated", icon: Radar },
  { label: "Policy Compliance", value: "98%", foot: "2 warnings", icon: Shield },
  { label: "Failed Sign-ins", value: "17", foot: "-11 vs yesterday", icon: Lock },
  { label: "Active Sessions", value: "211", foot: "stable session footprint", icon: Activity },
]

const SECURITY_POLICIES = [
  { title: "Enforce MFA", description: "Require MFA for all admin and manager roles", enabled: true },
  { title: "External Link Expiry", description: "Expire public shared links after 7 days", enabled: true },
  { title: "Geo-fencing", description: "Restrict sign-ins from unknown regions", enabled: false },
  { title: "Risk-based Session Timeout", description: "Auto-logoff on suspicious behavior", enabled: true },
]

const AUDIT_EVENTS = [
  {
    title: "Role escalation attempt blocked",
    detail: "user_analytics_bot requested admin scope outside policy templates",
    tone: "critical",
  },
  {
    title: "MFA challenge passed",
    detail: "workspace-admin completed second factor from trusted device",
    tone: "ok",
  },
  {
    title: "Unusual API burst detected",
    detail: "rate limiter throttled 418 requests from integration key #a2f9",
    tone: "warn",
  },
]

const toneClassMap = {
  ok: "text-emerald-700 bg-emerald-100",
  warn: "text-amber-700 bg-amber-100",
  critical: "text-red-700 bg-red-100",
}

export const SecuritySection = () => {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SECURITY_SUMMARY.map((item) => (
          <Card key={item.label} className="border-slate-200 bg-white">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{item.foot}</p>
              <item.icon className="h-4 w-4 text-cyan-700" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Security Policy Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SECURITY_POLICIES.map((policy) => (
              <div key={policy.title} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{policy.title}</p>
                  <p className="text-xs text-slate-500">{policy.description}</p>
                </div>
                <button
                  className={cn("h-6 w-11 rounded-full p-0.5 transition", policy.enabled ? "bg-cyan-600" : "bg-slate-300")}
                  type="button"
                >
                  <span className={cn("block h-5 w-5 rounded-full bg-white transition", policy.enabled ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Response Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2.5 text-sm text-cyan-800">
              Incident channel connected to SIEM and pager workflows.
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              Backup recovery drill passed in 14m 22s.
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
              Next compliance checkpoint: ISO-27001 evidence package in 5 days.
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Audit Signals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {AUDIT_EVENTS.map((event) => (
            <div key={event.title} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              {event.tone === "ok" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
              {event.tone === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />}
              {event.tone === "critical" && <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />}

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                <p className="text-sm text-slate-600">{event.detail}</p>
              </div>

              <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-semibold", toneClassMap[event.tone as keyof typeof toneClassMap])}>
                {event.tone === "ok" ? "Stable" : event.tone === "warn" ? "Warning" : "Critical"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
