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
      <div className="admin-shell-gradient pointer-events-none fixed inset-0 -z-10" />
    </div>
  )
}
