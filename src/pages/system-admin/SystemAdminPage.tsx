import { useState } from "react"
import {
  Check,
  ChevronRight,
  Clock3,
  X,
} from "lucide-react"
import { Header } from "@/components/common/Header"
import { Button } from "@/components/ui/button"
import {
  getSectionDescription,
  getSectionTitle,
} from "@/pages/system-admin/constants"
import { AccountManagementSection } from "@/pages/system-admin/components/sections/AccountManagementSection"
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

  const handleOpenRegisterTenant = () => {
    setIsRegisterTenantOpen(true)
  }

  const handleCloseRegisterTenant = () => {
    setIsRegisterTenantOpen(false)
  }

  return (
    <div
      className="admin-shell relative min-h-screen overflow-hidden bg-background text-foreground"
      style={{ fontFamily: '"Geist Variable", "IBM Plex Sans", "Segoe UI", sans-serif' }}
    >
      <div className="admin-shell-ambient pointer-events-none absolute inset-0" />

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
          <Header
            accountAccentClassName="bg-blue-100 text-blue-700"
            accountEmail="admin@sovereign.arch"
            accountName="Admin User"
            accountRole="System Architect"
            containerClassName="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur"
            innerClassName="px-4 py-3 md:px-6 xl:px-8"
            leadingContent={
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Sovereign Architect</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="truncate font-semibold text-slate-700">{getSectionTitle(activeSection)}</span>
                </div>
                <h1 className="truncate text-3xl font-bold tracking-tight text-slate-950">{getSectionTitle(activeSection)}</h1>
              </div>
            }
            onMenuClick={() => setIsSidebarOpen(true)}
            onOpenAccount={() => setActiveSection("account-management")}
            onOpenSettings={() => setActiveSection("account-management")}
            searchPlaceholder="Search resources..."
            showAccountAction={true}
          />

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
            {activeSection === "account-management" && <AccountManagementSection />}
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

      <div className="admin-shell-gradient pointer-events-none fixed inset-0 -z-10" />
    </div>
  )
}
