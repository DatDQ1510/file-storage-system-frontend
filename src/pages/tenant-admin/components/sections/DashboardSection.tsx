import {
  Activity,
  CircleDot,
  FolderKanban,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ACTIVITY_RECORDS, PENDING_APPROVALS, RESOURCE_SNAPSHOTS } from "@/pages/tenant-admin/constants"

export const DashboardSection = () => {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 bg-white/90 shadow-sm">
          <CardHeader className="pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total Members</p>
            <CardTitle className="text-4xl font-bold text-slate-900">125</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="inline-flex rounded-md bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">+2 This Week</span>
            <Users className="h-4 w-4 text-cyan-700" />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/90 shadow-sm">
          <CardHeader className="pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Active Projects</p>
            <CardTitle className="text-4xl font-bold text-slate-900">15</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Archived: 3</p>
            <FolderKanban className="h-4 w-4 text-cyan-700" />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/90 shadow-sm">
          <CardHeader className="pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Storage Quota</p>
            <CardTitle className="text-4xl font-bold text-slate-900">850 GB</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-cyan-600" style={{ width: "85%" }} />
            </div>
            <p className="text-xs text-slate-500">85% of 1 TB consumed</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-transparent bg-slate-900 text-slate-100 shadow-lg">
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-cyan-600/30 blur-2xl" />
          <CardHeader className="pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Security Posture</p>
            <CardTitle className="text-2xl font-semibold text-white">98% Trusted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm">Risky Links</span>
              <span className="text-lg font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm">Policy Violations</span>
              <span className="text-lg font-semibold">2</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">Recent Project Activity</CardTitle>
            <button className="text-xs font-semibold text-cyan-700" type="button">View History</button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ACTIVITY_RECORDS.map((activity) => (
              <div key={`${activity.actor}-${activity.timestamp}`} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <CircleDot className="mt-0.5 h-4 w-4 text-cyan-600" />
                <div>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{activity.actor}</span> {activity.action} {activity.resource}
                  </p>
                  <p className="text-xs text-slate-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">Pending Approvals</CardTitle>
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-xs font-extrabold text-white">3 NEW</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {PENDING_APPROVALS.map((item) => (
              <div key={item.type} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-900">{item.type}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="inline-flex rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Pending</span>
                  <button className="text-xs font-semibold text-cyan-700" type="button">Review</button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">Storage Allocation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {RESOURCE_SNAPSHOTS.map((snapshot) => {
              const usagePercent = Math.round((snapshot.used / snapshot.total) * 100)

              return (
                <div key={snapshot.department} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{snapshot.department}</p>
                  <p className="text-xs text-slate-500">{snapshot.used} GB / {snapshot.total} GB</p>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${usagePercent}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={cn("font-semibold", snapshot.statusColor)}>{snapshot.status}</span>
                    <span className="text-slate-500">{usagePercent}%</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2.5 text-xs text-cyan-800">
            <Activity className="h-4 w-4" />
            Resource telemetry updated 12 seconds ago
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            All department backup policies are healthy
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
