import { useState } from "react"
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Clock3,
  Globe,
  Menu,
  Search,
  X,
} from "lucide-react"
import { useNavigate } from "react-router"
import { AccountDropdownMenu } from "@/components/common/AccountDropdownMenu"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { signOut } from "@/lib/api/auth-service"
import {
  getSectionDescription,
  getSectionTitle,
} from "@/pages/system-admin/constants"
import { SidebarNavigation } from "@/pages/system-admin/components/SidebarNavigation"
import { BillingSection } from "@/pages/system-admin/components/sections/BillingSection"
import { DashboardSection } from "@/pages/system-admin/components/sections/DashboardSection"
import { InfrastructureSection } from "@/pages/system-admin/components/sections/InfrastructureSection"
import { QuotaSection } from "@/pages/system-admin/components/sections/QuotaSection"
import { TenantsSection } from "@/pages/system-admin/components/sections/TenantsSection"
import type { TSystemSection } from "@/pages/system-admin/types"

export const SystemAdminPage = () => {
  const [activeSection, setActiveSection] = useState<TSystemSection>("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRegisterTenantOpen, setIsRegisterTenantOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate(ROUTES.SIGN_IN, { replace: true })
  }

  const handleOpenRegisterTenant = () => {
    setIsRegisterTenantOpen(true)
  }

  const handleCloseRegisterTenant = () => {
    setIsRegisterTenantOpen(false)
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#eef2f7] text-slate-900"
      style={{ fontFamily: '"Geist Variable", "IBM Plex Sans", "Segoe UI", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(29,78,216,0.14),transparent_42%),radial-gradient(circle_at_88%_92%,rgba(30,64,175,0.12),transparent_38%)]" />

      <div className="relative flex min-h-screen">
        <div className="hidden xl:block">
          <SidebarNavigation activeSection={activeSection} onSelectSection={setActiveSection} />
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
              <SidebarNavigation
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
          <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/85 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 xl:px-8">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Sovereign Architect</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="truncate font-semibold text-slate-700">{getSectionTitle(activeSection)}</span>
                </div>
                <h1 className="truncate text-3xl font-bold tracking-tight text-slate-950">{getSectionTitle(activeSection)}</h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  className="xl:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                  size="icon"
                  variant="outline"
                >
                  <Menu className="h-4 w-4" />
                </Button>

                <label className="hidden h-10 w-64 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    placeholder="Search resources..."
                    type="text"
                  />
                </label>

                <Button size="icon" variant="ghost">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <CircleGauge className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Globe className="h-4 w-4" />
                </Button>

                <AccountDropdownMenu
                  accountEmail="admin@sovereign.arch"
                  accountName="Admin User"
                  accountRole="System Architect"
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 xl:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-4xl text-sm leading-relaxed text-slate-600">{getSectionDescription(activeSection)}</p>

              <div className="flex items-center gap-2">
                {activeSection === "tenants" && (
                  <>
                    <Button variant="outline" className="border-slate-300 bg-white">
                      Export List
                    </Button>
                    <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleOpenRegisterTenant}>+ Register New Tenant</Button>
                  </>
                )}

                {activeSection === "quota" && (
                  <>
                    <Button variant="ghost" className="text-slate-600">Hủy bỏ</Button>
                    <Button className="bg-blue-700 text-white hover:bg-blue-800">Lưu cấu hình</Button>
                  </>
                )}

                {activeSection === "billing" && (
                  <Button className="bg-blue-700 text-white hover:bg-blue-800">+ Create New Plan</Button>
                )}
              </div>
            </div>

            {activeSection === "dashboard" && <DashboardSection />}
            {activeSection === "tenants" && (
              <TenantsSection
                isRegisterTenantOpen={isRegisterTenantOpen}
                onCloseRegisterTenant={handleCloseRegisterTenant}
                onOpenRegisterTenant={handleOpenRegisterTenant}
              />
            )}
            {activeSection === "quota" && <QuotaSection />}
            {activeSection === "billing" && <BillingSection />}
            {[
              "redis-status",
              "rabbitmq-queue",
              "storage-nodes",
              "global-audit-logs",
              "blocked-ips",
            ].includes(activeSection) && <InfrastructureSection activeSection={activeSection} />}

            <div className="mt-5 flex items-center justify-end gap-2 text-sm text-slate-500">
              <button className="rounded-md border border-slate-300 bg-white p-1.5" type="button">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="rounded-md border border-blue-600 bg-blue-700 px-3 py-1 text-white" type="button">
                1
              </button>
              <button className="rounded-md border border-slate-300 bg-white px-3 py-1" type="button">
                2
              </button>
              <span>...</span>
              <button className="rounded-md border border-slate-300 bg-white px-3 py-1" type="button">
                12
              </button>
              <button className="rounded-md border border-slate-300 bg-white p-1.5" type="button">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>
        </div>
      </div>

      {activeSection === "billing" && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 max-w-sm rounded-xl border border-emerald-200 bg-white p-3 shadow-lg shadow-slate-900/15">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Plan Sync Successful</p>
              <p className="text-xs text-slate-600">Configuration pushed to 14 production nodes.</p>
            </div>
            <X className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      )}

      {activeSection === "dashboard" && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-lg shadow-slate-900/15 md:block">
          <p className="text-xs text-slate-500">Live audits updated</p>
          <p className="text-sm font-semibold text-slate-900">Last event 3s ago by security_scan_bot</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
            <Clock3 className="h-3.5 w-3.5" />
            Monitoring mode enabled
          </div>
        </div>
      )}

      {activeSection === "tenants" && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden max-w-sm rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/15 md:block">
          <p className="text-sm font-semibold text-slate-900">Pending Requests</p>
          <p className="mt-1 text-xs text-slate-600">3 businesses are waiting evaluation for Tier 4 custom enterprise plans.</p>
          <div className="mt-2 text-xs text-blue-700">Review queue now</div>
        </div>
      )}

      {activeSection === "quota" && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden max-w-sm rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/15 md:block">
          <p className="text-sm font-semibold text-slate-900">Quota Usage Insight</p>
          <p className="mt-1 text-xs text-slate-600">System storage is approaching 80% in 4 regions. Provision new nodes within 14 days.</p>
          <div className="mt-2 text-xs text-blue-700">View capacity planning report</div>
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(120deg,rgba(255,255,255,0.62)_0%,rgba(245,248,255,0.82)_35%,rgba(238,243,252,0.8)_100%)]" />
    </div>
  )
}
