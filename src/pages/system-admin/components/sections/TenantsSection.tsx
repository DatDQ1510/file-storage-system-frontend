import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { ChevronDown, ChevronRight, Filter, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTenantStatusClassName } from "@/pages/system-admin/constants"
import { TenantRegisterModal } from "@/pages/system-admin/components/sections/tenant/TenantRegisterModal"
import type {
  ITenantProvisionFormState,
  TTenantProvisionStep,
} from "@/pages/system-admin/components/sections/tenant/types"
import {
  getNextTenantProvisionStep,
  getPreviousTenantProvisionStep,
  INITIAL_SUBDOMAIN_AVAILABILITY,
  INITIAL_TENANT_PROVISION_FORM_STATE,
} from "@/pages/system-admin/components/sections/tenant/tenant-admin"
import {
  checkAdminAvailability,
  checkSubdomainAvailability,
  loadTenantRecords,
  submitTenantProvision,
} from "@/pages/system-admin/services/tenant-service"
import { loadPlanCards } from "@/pages/system-admin/services/billing-service"
import type {
  ITenantAdminAvailabilityResult,
  ITenantProvisionPayload,
  ITenantProvisionPlan,
  ITenantRecord,
  ITenantSubdomainAvailabilityResult,
  TTenantProvisionPlanName,
  TTenantStatus,
} from "@/pages/system-admin/types"
import { TENANT_PROVISION_PLANS } from "@/pages/system-admin/constants"
import { cn } from "@/lib/utils"
import {
  buildTenantProvisionPayload,
  normalizeSubdomainValue,
} from "@/helpers/validators/tenant-provision"

interface ITenantsSectionProps {
  isRegisterTenantOpen: boolean
  onOpenRegisterTenant: () => void
  onCloseRegisterTenant: () => void
}

export const TenantsSection = ({
  isRegisterTenantOpen,
  onOpenRegisterTenant,
  onCloseRegisterTenant,
}: ITenantsSectionProps) => {
  void onOpenRegisterTenant

  const [tenants, setTenants] = useState<ITenantRecord[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<ITenantProvisionPlan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<TTenantStatus | "all">("all")
  const [formState, setFormState] = useState<ITenantProvisionFormState>(INITIAL_TENANT_PROVISION_FORM_STATE)
  const [currentStep, setCurrentStep] = useState<TTenantProvisionStep>(1)
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false)
  const [subdomainAvailability, setSubdomainAvailability] =
    useState<ITenantSubdomainAvailabilityResult | null>(INITIAL_SUBDOMAIN_AVAILABILITY)
  const [adminAvailability, setAdminAvailability] =
    useState<ITenantAdminAvailabilityResult | null>(null)
  const [isCheckingAdminAvailability, setIsCheckingAdminAvailability] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmingProvision, setIsConfirmingProvision] = useState(false)
  const [pendingProvisionInput, setPendingProvisionInput] = useState<ITenantProvisionPayload | null>(null)

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const result = await loadTenantRecords()
        setTenants(result)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load tenant list")
      }
    }

    void loadTenants()
  }, [])

  useEffect(() => {
    const loadPlans = async () => {
      setIsLoadingPlans(true)

      try {
        const plans = await loadPlanCards()
        const mappedPlans: ITenantProvisionPlan[] = plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          storageQuota:
            plan.storageLimit === undefined || plan.storageLimit === null
              ? "N/A"
              : typeof plan.storageLimit === "number"
                ? `${plan.storageLimit} GB`
                : String(plan.storageLimit),
          maxUsers:
            plan.maxUsers === undefined || plan.maxUsers === null
              ? 0
              : typeof plan.maxUsers === "number"
                ? plan.maxUsers
                : Number(plan.maxUsers),
          description: plan.description ?? plan.features.join(" • "),
        }))

        setSubscriptionPlans(mappedPlans)

        if (mappedPlans.length > 0) {
          setFormState((current) => {
            const hasCurrentSelection = mappedPlans.some((plan) => plan.name === current.selectedPlanName)

            if (hasCurrentSelection) {
              return current
            }

            return {
              ...current,
              selectedPlanName: mappedPlans[0].name,
            }
          })
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load subscription plans")
      } finally {
        setIsLoadingPlans(false)
      }
    }

    void loadPlans()
  }, [])

  const summaryCards = useMemo(() => {
    const totalEnterprises = tenants.length
    const activeTrials = tenants.filter((tenant) => tenant.status === "Trial").length
    const infrastructureLoad = Math.round(
      (tenants.reduce((sum, tenant) => sum + tenant.quotaPercent, 0) / (tenants.length * 100)) * 100
    )
    const revenueRunRate = `$${(tenants.filter((tenant) => tenant.status === "Active").length * 0.8 + 1.6).toFixed(1)}M`

    return [
      { label: "Total Enterprises", value: totalEnterprises.toLocaleString("en-US"), foot: "+12% this month" },
      { label: "Active Trials", value: activeTrials.toString(), foot: "pending conversion" },
      { label: "Infrastructure Load", value: `${Math.min(infrastructureLoad, 100)}%`, foot: "stable across clusters" },
      { label: "Revenue Run Rate", value: revenueRunRate, foot: "annualized growth +24%" },
    ]
  }, [tenants])

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const normalizedSearch = searchTerm.trim().toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 ||
        tenant.businessName.toLowerCase().includes(normalizedSearch) ||
        tenant.nodeCode.toLowerCase().includes(normalizedSearch) ||
        tenant.adminName.toLowerCase().includes(normalizedSearch) ||
        tenant.adminEmail.toLowerCase().includes(normalizedSearch)
      const matchesStatus = selectedStatus === "all" || tenant.status === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [searchTerm, selectedStatus, tenants])

  const selectedPlan = useMemo<ITenantProvisionPlan>(() => {
    return (
      subscriptionPlans.find((plan) => plan.name === formState.selectedPlanName) ??
      TENANT_PROVISION_PLANS.find((plan) => plan.name === formState.selectedPlanName) ??
      subscriptionPlans[0] ??
      TENANT_PROVISION_PLANS[1]
    )
  }, [formState.selectedPlanName, subscriptionPlans])

  const handleInputChange = <K extends keyof ITenantProvisionFormState>(field: K) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.value as ITenantProvisionFormState[K]

    if (field === "subdomain") {
      setSubdomainAvailability(null)
    }

    if (field === "adminEmail" || field === "adminPhoneNumber") {
      setAdminAvailability(null)
    }

    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCloseProvisionModal = () => {
    setCurrentStep(1)
    setFormState(INITIAL_TENANT_PROVISION_FORM_STATE)
    setSubdomainAvailability(null)
    setAdminAvailability(null)
    setIsCheckingSubdomain(false)
    setIsCheckingAdminAvailability(false)
    setIsSubmitting(false)
    onCloseRegisterTenant()
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!formState.companyName.trim()) {
        toast.error("Please enter company name.")
        return
      }

      if (!formState.subdomain.trim()) {
        toast.error("Please enter tenant domain.")
        return
      }

      setIsCheckingSubdomain(true)

      try {
        const availability = await checkSubdomainAvailability(formState.subdomain)
        setSubdomainAvailability(availability)

        if (!availability.isAvailable) {
          toast.error(availability.message || "Domain tenant already exists")
          return
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to verify tenant domain."
        setSubdomainAvailability({
          subdomain: normalizeSubdomainValue(formState.subdomain),
          isAvailable: false,
          message,
        })
        toast.error(message)
        return
      } finally {
        setIsCheckingSubdomain(false)
      }
    }

    if (currentStep === 2) {
      if (!formState.adminFullName.trim() || !formState.adminEmail.trim() || !formState.adminPhoneNumber.trim()) {
        toast.error("Please complete the admin information first.")
        return
      }

      setIsCheckingAdminAvailability(true)

      try {
        const availability = await checkAdminAvailability({
          username: formState.adminFullName,
          email: formState.adminEmail,
          phoneNumber: formState.adminPhoneNumber,
        })
        setAdminAvailability(availability)

        if (!availability.available) {
          toast.error(availability.message || "Email or phone number already exists")
          return
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to verify tenant admin."
        setAdminAvailability({
          available: false,
          message,
          isEmailAvailable: false,
          isPhoneNumberAvailable: false,
        })
        toast.error(message)
        return
      } finally {
        setIsCheckingAdminAvailability(false)
      }
    }

    setCurrentStep(getNextTenantProvisionStep(currentStep))
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(getPreviousTenantProvisionStep(currentStep))
    }
  }

  const handleSelectPlan = (planName: TTenantProvisionPlanName) => {
    setFormState((current) => ({
      ...current,
      selectedPlanName: planName,
    }))
  }

  const handleRegisterTenant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.companyName.trim()) {
      toast.error("Please enter company name.")
      setCurrentStep(1)
      return
    }

    if (!formState.subdomain.trim()) {
      toast.error("Please enter tenant domain.")
      setCurrentStep(1)
      return
    }

    if (!formState.adminFullName.trim() || !formState.adminEmail.trim() || !formState.adminPhoneNumber.trim()) {
      toast.error("Please complete the admin information first.")
      setCurrentStep(2)
      return
    }

    if (formState.adminFullName.trim().length > 100) {
      toast.error("Username must be at most 100 characters.")
      setCurrentStep(2)
      return
    }

    if (!selectedPlan.id?.trim()) {
      toast.error("Selected plan is invalid. Please reload subscription plans and try again.")
      setCurrentStep(3)
      return
    }

    const tenantInput: ITenantProvisionPayload = buildTenantProvisionPayload(
      formState.companyName,
      formState.subdomain,
      {
        fullName: formState.adminFullName,
        email: formState.adminEmail,
        phoneNumber: formState.adminPhoneNumber,
      },
      selectedPlan
    )

    setPendingProvisionInput(tenantInput)
    setIsConfirmingProvision(true)
    return

    // The actual provisioning request is handled when the user confirms the modal.
  }

  const handleCancelProvision = () => {
    setIsConfirmingProvision(false)
    setPendingProvisionInput(null)
  }

  const handleConfirmProvision = async () => {
    if (!pendingProvisionInput) {
      return
    }

    if (!pendingProvisionInput.plan.id?.trim()) {
      toast.error("Missing planId. Please re-select a valid subscription plan.")
      setIsConfirmingProvision(false)
      setCurrentStep(3)
      return
    }

    setIsSubmitting(true)
    setIsConfirmingProvision(false)

    try {
      const provisionResult = await submitTenantProvision(pendingProvisionInput)
      setTenants((current) => [
        {
          businessName: pendingProvisionInput.companyName,
          nodeCode: provisionResult.tenantDomain,
          status: "Trial",
          plan: pendingProvisionInput.plan.name,
          quotaUsed: pendingProvisionInput.plan.storageQuota,
          quotaPercent: 0,
          createdDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
          region: "Provisioning",
          adminName: provisionResult.tenantAdminUserName,
          adminEmail: pendingProvisionInput.admin.email,
        },
        ...current,
      ])
      toast.success("Tenant provisioned successfully.", {
        description: `Domain: ${provisionResult.tenantDomain}`,
      })
      toast.info("Generated tenant admin password", {
        description: provisionResult.generatedTenantAdminPassword,
      })
      setFormState(INITIAL_TENANT_PROVISION_FORM_STATE)
      setSubdomainAvailability(null)
      setAdminAvailability(null)
      setCurrentStep(1)
      setPendingProvisionInput(null)
      onCloseRegisterTenant()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to provision tenant")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((summary) => (
          <Card key={summary.label} className="border-slate-200 bg-white/90 shadow-sm">
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
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Active Enterprise Tenants</CardTitle>
            <p className="mt-1 text-xs text-slate-500">Monitor tenant status, plan usage, and onboarding date in one table.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search tenants..."
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
              onChange={(event) => setSelectedStatus(event.target.value as TTenantStatus | "all")}
              value={selectedStatus}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Suspended">Suspended</option>
            </select>

            <Button
              size="sm"
              variant="outline"
              className="border-slate-300 text-slate-600"
              onClick={() => {
                setSearchTerm("")
                setSelectedStatus("all")
              }}
            >
              <Filter className="h-4 w-4" />
              Reset
              <ChevronDown className="h-4 w-4" />
            </Button>

          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3">Business Name</th>
                <th className="py-3">Admin Contact</th>
                <th className="py-3">Status</th>
                <th className="py-3">Plan</th>
                <th className="py-3">Quota Used</th>
                <th className="py-3">Region</th>
                <th className="py-3">Created Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.businessName} className="border-b border-slate-100 last:border-none">
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">{tenant.businessName}</p>
                    <p className="text-xs text-slate-500">{tenant.nodeCode}</p>
                  </td>
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">{tenant.adminName}</p>
                    <p className="text-xs text-slate-500">{tenant.adminEmail}</p>
                  </td>
                  <td>
                    <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-semibold", getTenantStatusClassName(tenant.status))}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="text-slate-700">{tenant.plan}</td>
                  <td>
                    <div className="w-32">
                      <p className="mb-1 text-xs font-semibold text-slate-700">{tenant.quotaUsed}</p>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${tenant.quotaPercent}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-700">{tenant.region}</td>
                  <td className="text-slate-700">{tenant.createdDate}</td>
                  <td className="text-right">
                    <Button size="icon-sm" variant="ghost" className="text-slate-500">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <TenantRegisterModal
        isOpen={isRegisterTenantOpen}
        currentStep={currentStep}
        formState={formState}
        selectedPlan={selectedPlan}
        plans={subscriptionPlans}
        isLoadingPlans={isLoadingPlans}
        subdomainAvailability={subdomainAvailability}
        adminAvailability={adminAvailability}
        isCheckingSubdomain={isCheckingSubdomain}
        isCheckingAdminAvailability={isCheckingAdminAvailability}
        isSubmitting={isSubmitting}
        onClose={handleCloseProvisionModal}
        onBack={handlePreviousStep}
        onNext={handleNextStep}
        onChange={handleInputChange}
        onSelectPlan={handleSelectPlan}
        onSubmit={handleRegisterTenant}
      />

      {isConfirmingProvision && pendingProvisionInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Xác nhận Provision Tenant</h3>
              <p className="mt-1 text-sm text-slate-600">
                Vui lòng kiểm tra lại thông tin tenant trước khi gửi yêu cầu provisioning.
              </p>
            </div>

            <div className="space-y-4 p-6 text-sm text-slate-700">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tổ chức</p>
                  <p className="font-medium text-slate-900">{pendingProvisionInput.companyName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Domain tenant</p>
                  <p className="font-medium text-slate-900">{pendingProvisionInput.subdomain}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Root admin</p>
                  <p className="font-medium text-slate-900">{pendingProvisionInput.admin.fullName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">{pendingProvisionInput.admin.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Số điện thoại</p>
                  <p className="font-medium text-slate-900">{pendingProvisionInput.admin.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Gói dịch vụ</p>
                  <p className="font-medium text-slate-900">{pendingProvisionInput.plan.name} ({pendingProvisionInput.plan.storageQuota})</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={handleCancelProvision} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button
                type="button"
                className="bg-blue-700 text-white hover:bg-blue-800"
                onClick={handleConfirmProvision}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Provisioning..." : "Xác nhận & Provision"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
