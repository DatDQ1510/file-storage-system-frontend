import {
  Building2,
  ChevronDown,
  ChevronRight,
  Cloud,
  Ellipsis,
  Filter,
  FolderKanban,
  Landmark,
  Search,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PROJECT_RECORDS, getProjectStatusClassName } from "@/pages/tenant-admin/constants"

const PROJECT_ICON_MAP = {
  folder: FolderKanban,
  cloud_queue: Cloud,
  gavel: Landmark,
  palette: Building2,
  account_balance: Landmark,
} as const

export const ProjectsSection = () => {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Projects", value: "124", foot: "+8 new this month" },
          { label: "Active Delivery", value: "78", foot: "steady velocity" },
          { label: "Planning", value: "31", foot: "resource alignment" },
          { label: "Archived", value: "15", foot: "retention ready" },
        ].map((summary) => (
          <Card key={summary.label} className="border-slate-200 bg-white">
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
          <CardTitle className="text-lg font-semibold text-slate-900">Project Workspace Registry</CardTitle>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search project or PM"
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
                <th className="py-3">Project</th>
                <th className="py-3">Department</th>
                <th className="py-3">Members</th>
                <th className="py-3">Storage</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {PROJECT_RECORDS.map((project) => {
                const Icon = PROJECT_ICON_MAP[project.icon as keyof typeof PROJECT_ICON_MAP] ?? FolderKanban

                return (
                  <tr key={project.id} className="border-b border-slate-100 last:border-none">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("grid h-10 w-10 place-items-center rounded-lg", project.iconBg, project.iconColor)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{project.name}</p>
                          <p className="text-xs text-slate-500">PM: {project.pm}</p>
                        </div>
                      </div>
                    </td>

                    <td className="text-slate-700">{project.department}</td>

                    <td>
                      <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <Users className="h-3.5 w-3.5" />
                        {project.membersCount} members
                      </div>
                    </td>

                    <td>
                      <div className="w-32">
                        <p className="mb-1 text-xs font-semibold text-slate-700">{project.storageUsed} / {project.storageTotal}</p>
                        <div className="h-2 rounded-full bg-slate-200">
                          <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${project.storagePercent}%` }} />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-semibold", getProjectStatusClassName(project.status))}>
                        {project.status}
                      </span>
                    </td>

                    <td className="text-right">
                      <Button size="icon-sm" variant="ghost" className="text-slate-500">
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
            <p className="text-slate-500">Showing 1 to 10 of 124 projects</p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="text-slate-500">
                <ChevronRight className="h-4 w-4 rotate-180" />
                Prev
              </Button>
              <Button size="sm" className="bg-cyan-700 text-white hover:bg-cyan-800">1</Button>
              <Button size="sm" variant="outline" className="border-slate-300">2</Button>
              <Button size="sm" variant="outline" className="border-slate-300">3</Button>
              <Button size="sm" variant="ghost" className="text-slate-500">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
