import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/common/Header"
import {
  getSectionDescription,
  getSectionTitle,
} from "@/pages/system-admin/constants"
import { AccountManagementSection } from "@/pages/system-admin/components/sections/AccountManagementSection"
import { SidebarNavigation } from "@/pages/system-admin/components/SidebarNavigation"
import { BillingSection } from "@/pages/system-admin/components/sections/BillingSection"
import { CreatePlanModal } from "@/pages/system-admin/components/sections/billing/CreatePlanModal"
import { DashboardSection } from "@/pages/system-admin/components/sections/DashboardSection"
import { TenantsSection } from "@/pages/system-admin/components/sections/TenantsSection"
import { SystemAdminSectionActions } from "@/pages/system-admin/components/SystemAdminSectionActions"
import { addPlanCard } from "@/pages/system-admin/services/billing-service"
import type { INewPlanInput, TSystemSection } from "@/pages/system-admin/types"

export const SystemAdminPage = () => {
  const [activeSection, setActiveSection] = useState<TSystemSection>("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRegisterTenantOpen, setIsRegisterTenantOpen] = useState(false)
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false)
  const [createPlanForm, setCreatePlanForm] = useState<INewPlanInput>({
    name: "",
    status: "Active",
    description: "",
    storageLimit: 0,
    maxUsers: 0,
    billingCycle: "Monthly",
    price: 0,
    features: [],
  })
  const [customFeature, setCustomFeature] = useState("")

  const handleOpenRegisterTenant = () => {
    setIsRegisterTenantOpen(true)
  }

  const handleCloseRegisterTenant = () => {
    setIsRegisterTenantOpen(false)
  }

  const handleOpenCreatePlan = () => {
    setIsCreatePlanOpen(true)
  }

  const handleCloseCreatePlan = () => {
    setIsCreatePlanOpen(false)
    setCreatePlanForm({
      name: "",
      status: "Active",
      description: "",
      storageLimit: 0,
      maxUsers: 0,
      billingCycle: "Monthly",
      price: 0,
      features: [],
    })
    setCustomFeature("")
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
              <SystemAdminSectionActions
                activeSection={activeSection}
                onOpenRegisterTenant={handleOpenRegisterTenant}
                onCreatePlan={handleOpenCreatePlan}
              />
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
            {activeSection === "billing" && <BillingSection />}

          </main>
        </div>
      </div>

      <CreatePlanModal
        isOpen={isCreatePlanOpen}
        formState={createPlanForm}
        customFeature={customFeature}
        onClose={handleCloseCreatePlan}
        onChange={(field) => (event) => {
          const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          setCreatePlanForm((prev) => ({
            ...prev,
            [field]: target.type === "number" ? (target.value === "" ? 0 : Number(target.value)) : target.value,
          }))
        }}
        onFeatureToggle={(feature) => {
          setCreatePlanForm((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
              ? prev.features.filter((f) => f !== feature)
              : [...prev.features, feature],
          }))
        }}
        onCustomFeatureChange={setCustomFeature}
        onSubmit={async (event) => {
          event.preventDefault()
          await addPlanCard(createPlanForm)
          handleCloseCreatePlan()
        }}
      />

      <div className="admin-shell-gradient pointer-events-none fixed inset-0 -z-10" />
    </div>
  )
}
