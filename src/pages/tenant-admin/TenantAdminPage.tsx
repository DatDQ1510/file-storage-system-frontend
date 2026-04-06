import { useState } from "react"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  X,
} from "lucide-react"
import { Header } from "@/components/common/Header"
import { Button } from "@/components/ui/button"
import { DashboardSection } from "@/pages/tenant-admin/components/sections/DashboardSection"
import { OrganizationSection } from "@/pages/tenant-admin/components/sections/OrganizationSection"
import { ProjectsSection } from "@/pages/tenant-admin/components/sections/ProjectsSection"
import { SecuritySection } from "@/pages/tenant-admin/components/sections/SecuritySection"
import { TenantSidebar } from "@/pages/tenant-admin/components/TenantSidebar"
import {
  getSectionDescription,
  getSectionTitle,
} from "@/pages/tenant-admin/constants"
import type { TTenantAdminSection } from "@/pages/tenant-admin/types"

export const TenantAdminPage = () => {
  const [activeSection, setActiveSection] = useState<TTenantAdminSection>("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div
      className="admin-shell relative min-h-screen overflow-hidden bg-background text-foreground"
      style={{ fontFamily: '"Geist Variable", "IBM Plex Sans", "Segoe UI", sans-serif' }}
    >
      <div className="admin-shell-ambient pointer-events-none absolute inset-0" />

      <div className="relative flex min-h-screen">
        <div className="hidden xl:block">
          <TenantSidebar activeSection={activeSection} onSelectSection={setActiveSection} />
        </div>

        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 xl:hidden">
            <button
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-950/35"
              onClick={() => setIsSidebarOpen(false)}
              type="button"
            />
            <div className="relative h-full w-72 max-w-[88vw] shadow-2xl">
              <TenantSidebar
                activeSection={activeSection}
                onSelectSection={(section) => {
                  setActiveSection(section)
                  setIsSidebarOpen(false)
                }}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            accountAccentClassName="bg-cyan-100 text-cyan-700"
            accountEmail="owner@workspace.arch"
            accountName="Tenant Owner"
            accountRole="Workspace Administrator"
            containerClassName="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur"
            innerClassName="px-4 py-3 md:px-6 xl:px-8"
            leadingContent={
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Sovereign Architect</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="truncate font-semibold text-slate-700">Tenant Admin</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="truncate font-semibold text-slate-700">{getSectionTitle(activeSection)}</span>
                </div>
                <h1 className="truncate text-3xl font-bold tracking-tight text-slate-950">{getSectionTitle(activeSection)}</h1>
              </div>
            }
            onMenuClick={() => setIsSidebarOpen(true)}
            searchPlaceholder="Search workspace resources..."
          />

          <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 xl:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-4xl text-sm leading-relaxed text-slate-600">{getSectionDescription(activeSection)}</p>

              <div className="flex items-center gap-2">
                {activeSection === "projects" && (
                  <>
                    <Button variant="outline" className="border-slate-300 bg-white">
                      Export Project Report
                    </Button>
                    <Button className="bg-cyan-700 text-white hover:bg-cyan-800">+ Create New Project</Button>
                  </>
                )}

                {activeSection === "security" && (
                  <Button className="bg-cyan-700 text-white hover:bg-cyan-800">Generate Security Snapshot</Button>
                )}
              </div>
            </div>

            {activeSection === "dashboard" && <DashboardSection />}
            {activeSection === "projects" && <ProjectsSection />}
            {activeSection === "organization" && <OrganizationSection />}
            {activeSection === "security" && <SecuritySection />}

            <div className="mt-5 flex items-center justify-end gap-2 text-sm text-slate-500">
              <button className="rounded-md border border-slate-300 bg-white p-1.5" type="button">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="rounded-md border border-cyan-700 bg-cyan-700 px-3 py-1 text-white" type="button">
                1
              </button>
              <button className="rounded-md border border-slate-300 bg-white px-3 py-1" type="button">
                2
              </button>
              <span>...</span>
              <button className="rounded-md border border-slate-300 bg-white px-3 py-1" type="button">
                9
              </button>
              <button className="rounded-md border border-slate-300 bg-white p-1.5" type="button">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>
        </div>
      </div>

      {activeSection === "dashboard" && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-lg shadow-slate-900/15 md:block">
          <p className="text-xs text-slate-500">Workspace stream updated</p>
          <p className="text-sm font-semibold text-slate-900">Last sync 8s ago by automation_bot</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
            <Clock3 className="h-3.5 w-3.5" />
            Drift protection enabled
          </div>
        </div>
      )}

      {activeSection === "projects" && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden max-w-sm rounded-xl border border-cyan-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/15 md:block">
          <p className="text-sm font-semibold text-slate-900">Pending Project Actions</p>
          <p className="mt-1 text-xs text-slate-600">2 new repositories require access policy reviews from workspace owners.</p>
          <div className="mt-2 text-xs text-cyan-700">Open project review queue</div>
        </div>
      )}

      {activeSection === "organization" && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden max-w-sm rounded-xl border border-cyan-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/15 md:block">
          <p className="text-sm font-semibold text-slate-900">Organization Notice</p>
          <p className="mt-1 text-xs text-slate-600">7 pending member requests need role assignment before Monday's compliance audit.</p>
          <div className="mt-2 text-xs text-cyan-700">Review members now</div>
        </div>
      )}

      {activeSection === "security" && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm rounded-xl border border-emerald-200 bg-white p-3 shadow-lg shadow-slate-900/15">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Security Posture Stable</p>
              <p className="text-xs text-slate-600">No critical incidents detected in the last 24 hours.</p>
            </div>
            <X className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      )}

      <div className="admin-shell-gradient pointer-events-none fixed inset-0 -z-10" />
    </div>
  )
}
