import { useCallback, useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Filter, Power, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTenantStatusClassName, getTenantStatusLabel } from "@/pages/system-admin/constants"
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
  loadTenantRecordPage,
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
  const [isLoadingTenants, setIsLoadingTenants] = useState(false)
  const [page, setPage] = useState(0)
  const [offset, setOffset] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [selectedTenantDetail, setSelectedTenantDetail] = useState<ITenantRecord | null>(null)
  const [updatingTenantId, setUpdatingTenantId] = useState<string | null>(null)
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

  const loadTenants = useCallback(async () => {
    setIsLoadingTenants(true)

    try {
      const tenantPage = await loadTenantRecordPage({
        page,
        offset,
      })

      setTenants(tenantPage.items)
      setPage(tenantPage.page)
      setOffset(tenantPage.offset)
      setTotalElements(tenantPage.totalElements)
      setTotalPages(Math.max(tenantPage.totalPages, 1))
      setHasNext(tenantPage.hasNext)
      setHasPrevious(tenantPage.hasPrevious)
      setIsUsingMockData(Boolean(tenantPage.isMockData))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải danh sách tenant")
    } finally {
      setIsLoadingTenants(false)
    }
  }, [offset, page])

  useEffect(() => {
    void loadTenants()
  }, [loadTenants])

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
              ? "Không có"
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
          toast.error(error instanceof Error ? error.message : "Không thể tải danh sách gói dịch vụ")
      } finally {
        setIsLoadingPlans(false)
      }
    }

    void loadPlans()
  }, [])

  const summaryCards = useMemo(() => {
    const totalEnterprises = tenants.length
    const activeTrials = tenants.filter((tenant) => tenant.status === "Trial").length
    const totalQuotaPercent = tenants.reduce((sum, tenant) => sum + tenant.quotaPercent, 0)
    const infrastructureLoad = Math.round(
      tenants.length > 0 ? (totalQuotaPercent / (tenants.length * 100)) * 100 : 0
    )
      const revenueRunRate = `$${(tenants.filter((tenant) => tenant.status === "Active").length * 0.8 + 1.6).toFixed(1)}M`

    return [
      { label: "Tổng doanh nghiệp", value: totalEnterprises.toLocaleString("vi-VN"), foot: "+12% trong tháng này" },
      { label: "Tenant dùng thử", value: activeTrials.toString(), foot: "đang chờ chuyển đổi" },
      { label: "Mức tải hạ tầng", value: `${Math.min(infrastructureLoad, 100)}%`, foot: "ổn định trên các cụm" },
      { label: "Tốc độ doanh thu", value: revenueRunRate, foot: "tăng trưởng quy đổi năm +24%" },
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
        toast.error("Vui lòng nhập tên công ty.")
        return
      }

      if (!formState.subdomain.trim()) {
        toast.error("Vui lòng nhập domain tenant.")
        return
      }

      setIsCheckingSubdomain(true)

      try {
        const availability = await checkSubdomainAvailability(formState.subdomain)
        setSubdomainAvailability(availability)

        if (!availability.isAvailable) {
          toast.error(availability.message || "Domain tenant đã tồn tại")
          return
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không thể kiểm tra domain tenant."
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
        toast.error("Vui lòng hoàn tất thông tin quản trị viên trước.")
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
          toast.error(availability.message || "Email hoặc số điện thoại đã tồn tại")
          return
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không thể kiểm tra tài khoản quản trị viên tenant."
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
      toast.error("Vui lòng nhập tên công ty.")
      setCurrentStep(1)
      return
    }

    if (!formState.subdomain.trim()) {
      toast.error("Vui lòng nhập domain tenant.")
      setCurrentStep(1)
      return
    }

    if (!formState.adminFullName.trim() || !formState.adminEmail.trim() || !formState.adminPhoneNumber.trim()) {
      toast.error("Vui lòng hoàn tất thông tin quản trị viên trước.")
      setCurrentStep(2)
      return
    }

    if (formState.adminFullName.trim().length > 100) {
      toast.error("Tên đăng nhập tối đa 100 ký tự.")
      setCurrentStep(2)
      return
    }

    if (!selectedPlan.id?.trim()) {
      toast.error("Gói đã chọn không hợp lệ. Vui lòng tải lại danh sách gói và thử lại.")
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

    // Yêu cầu cấp phát thực tế sẽ được thực hiện sau khi người dùng xác nhận hộp thoại.
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
      toast.error("Thiếu planId. Vui lòng chọn lại gói dịch vụ hợp lệ.")
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
          id: provisionResult.tenantId,
          businessName: pendingProvisionInput.companyName,
          nodeCode: provisionResult.tenantDomain,
          status: "Trial",
          plan: pendingProvisionInput.plan.name,
          quotaUsed: pendingProvisionInput.plan.storageQuota,
          quotaPercent: 0,
          createdDate: new Date().toLocaleDateString("vi-VN", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          region: "Vietnam",
          adminName: provisionResult.tenantAdminUserName,
          adminEmail: pendingProvisionInput.admin.email,
        },
        ...current,
      ])
      toast.success("Cấp phát tenant thành công.", {
        description: `Tên miền: ${provisionResult.tenantDomain}`,
      })

      setFormState(INITIAL_TENANT_PROVISION_FORM_STATE)
      setSubdomainAvailability(null)
      setAdminAvailability(null)
      setCurrentStep(1)
      setPendingProvisionInput(null)
      onCloseRegisterTenant()
      setTotalElements((current) => current + 1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cấp phát tenant")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewTenantDetail = (tenant: ITenantRecord) => {
    setSelectedTenantDetail(tenant)
  }

  const handleCloseTenantDetail = () => {
    setSelectedTenantDetail(null)
  }

  const handleToggleTenantStatus = async (tenant: ITenantRecord) => {
    const nextStatus: TTenantStatus = tenant.status === "Suspended" ? "Active" : "Suspended"
    setUpdatingTenantId(tenant.id ?? tenant.businessName)

    try {
      setTenants((current) =>
        current.map((item) => {
          const isTargetTenant = (item.id && item.id === tenant.id) || item.businessName === tenant.businessName
          return isTargetTenant
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        })
      )

      toast.success(
        nextStatus === "Suspended"
          ? "Đã chuyển trạng thái tenant sang Tạm ngưng"
          : "Đã chuyển trạng thái tenant sang Đang hoạt động"
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái tenant")
    } finally {
      setUpdatingTenantId(null)
    }
  }

  const handleOffsetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextOffset = Number(event.target.value)

    if (!Number.isFinite(nextOffset) || nextOffset <= 0) {
      return
    }

    setOffset(nextOffset)
    setPage(0)
  }

  const handlePreviousPage = () => {
    if (!hasPrevious || isLoadingTenants) {
      return
    }

    setPage((current) => Math.max(current - 1, 0))
  }

  const handleNextPage = () => {
    if (!hasNext || isLoadingTenants) {
      return
    }

    setPage((current) => current + 1)
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
            <CardTitle className="text-lg font-semibold text-slate-900">Danh sách tenant doanh nghiệp</CardTitle>
            <p className="mt-1 text-xs text-slate-500">Theo dõi trạng thái, mức sử dụng gói và thời điểm khởi tạo tenant trong một bảng.</p>
            {isUsingMockData && (
              <p className="mt-1 text-xs font-semibold text-amber-600">
                Đang dùng dữ liệu tenant mẫu vì API danh sách tenant chưa khả dụng.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Tìm tenant..."
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
              <option value="all">Tất cả trạng thái</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Trial">Dùng thử</option>
              <option value="Suspended">Tạm ngưng</option>
            </select>

            <Button
              size="sm"
              variant="outline"
              className="border-slate-300 text-slate-600"
              onClick={() => {
                setSearchTerm("")
                setSelectedStatus("all")
                setPage(0)
              }}
            >
              <Filter className="h-4 w-4" />
              Đặt lại
              <ChevronDown className="h-4 w-4" />
            </Button>

            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
              onChange={handleOffsetChange}
              value={offset}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>

          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3">Tên doanh nghiệp</th>
                <th className="py-3">Liên hệ quản trị</th>
                <th className="py-3">Trạng thái</th>
                <th className="py-3">Gói</th>
                <th className="py-3">Dung lượng đã dùng</th>
                <th className="py-3">Khu vực</th>
                <th className="py-3">Ngày tạo</th>
                <th className="py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTenants ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                    Đang tải danh sách tenant...
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                    Không tìm thấy tenant phù hợp bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id ?? tenant.businessName} className="border-b border-slate-100 last:border-none">
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
                        {getTenantStatusLabel(tenant.status)}
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
                    <td>
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-600"
                          onClick={() => handleViewTenantDetail(tenant)}
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 text-slate-600"
                          onClick={() => handleToggleTenantStatus(tenant)}
                          disabled={updatingTenantId === (tenant.id ?? tenant.businessName)}
                        >
                          <Power className="h-4 w-4" />
                          {tenant.status === "Suspended" ? "Kích hoạt" : "Tạm ngưng"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Trang <span className="font-semibold text-slate-900">{page + 1}</span> / {totalPages} - tổng tenant: {totalElements}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-300"
                onClick={handlePreviousPage}
                disabled={!hasPrevious || isLoadingTenants}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-300"
                onClick={handleNextPage}
                disabled={!hasNext || isLoadingTenants}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
              <h3 className="text-lg font-semibold text-slate-900">Xác nhận cấp phát tenant</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Vui lòng kiểm tra lại thông tin tenant trước khi gửi yêu cầu cấp phát.
                </p>
            </div>

            <div className="space-y-4 p-6 text-sm text-slate-700">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tổ chức</p>
                  <p className="font-medium text-slate-900">{pendingProvisionInput.companyName}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tên miền tenant</p>
                  <p className="font-medium text-slate-900">{pendingProvisionInput.subdomain}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quản trị viên</p>
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
                  {isSubmitting ? "Đang cấp phát..." : "Xác nhận & cấp phát"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedTenantDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Chi tiết tenant</h3>
              <p className="mt-1 text-sm text-slate-600">Thông tin tenant và ảnh chụp nhanh trạng thái gói hiện tại.</p>
            </div>

            <div className="grid gap-4 p-6 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tên tenant</p>
                <p className="font-medium text-slate-900">{selectedTenantDetail.businessName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tên miền</p>
                <p className="font-medium text-slate-900">{selectedTenantDetail.nodeCode}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quản trị viên</p>
                <p className="font-medium text-slate-900">{selectedTenantDetail.adminName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email quản trị viên</p>
                <p className="font-medium text-slate-900">{selectedTenantDetail.adminEmail}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Số điện thoại quản trị viên</p>
                <p className="font-medium text-slate-900">{selectedTenantDetail.adminPhoneNumber ?? "Không có"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Trạng thái</p>
                <p className="font-medium text-slate-900">{getTenantStatusLabel(selectedTenantDetail.status)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Gói dịch vụ</p>
                <p className="font-medium text-slate-900">{selectedTenantDetail.plan}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Dung lượng đã dùng</p>
                <p className="font-medium text-slate-900">{selectedTenantDetail.quotaUsed}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ngày tạo</p>
                <p className="font-medium text-slate-900">{selectedTenantDetail.createdDate}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Trạng thái gói</p>
                <p className="font-medium text-slate-900">{selectedTenantDetail.tenantPlanStatus ?? "Không có"}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Button type="button" variant="ghost" onClick={handleCloseTenantDetail}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
