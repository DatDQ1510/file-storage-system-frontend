import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"
import { useNavigate } from "react-router"
import { Check, ChevronLeft, Plus, Settings2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { addPlanCard } from "@/pages/system-admin/services/billing-service"
import type { INewPlanInput, TBillingCycle, TBillingStatus } from "@/pages/system-admin/types"

const BILLING_CYCLES: TBillingCycle[] = ["Monthly", "Quarterly", "Yearly"]
const BILLING_STATUS: TBillingStatus[] = ["Active", "Inactive"]
const DEFAULT_FEATURES = [
  "Xác thực SSO",
  "Truy cập API",
  "Hỗ trợ ưu tiên 24/7",
  "Phân tích nâng cao",
  "Tên miền tùy chỉnh",
  "Nhật ký kiểm toán",
]

export const CreatePlanPage = () => {
  const navigate = useNavigate()

  const [formState, setFormState] = useState<INewPlanInput>({
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const inputClass =
    "create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500"

  const handleChange =
    <K extends keyof INewPlanInput>(field: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value } = event.target
      setFormState((prev) => ({
        ...prev,
        [field]: field === "storageLimit" || field === "maxUsers" || field === "price" ? Number(value) : value,
      }))
    }

  const handleFeatureToggle = (feature: string) => {
    setFormState((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const created = await addPlanCard(formState)
      if (created.id) {
        navigate(ROUTES.SYSTEM_ADMIN_PLAN_DETAIL.replace(":planId", created.id))
      } else {
        navigate(-1)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-6 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:opacity-80"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại trang gói cước
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">Tạo gói dịch vụ mới</h1>
            <p className="text-base text-slate-600">
              Thiết lập bậc gói mới cho hệ thống. Đảm bảo giới hạn tài nguyên phù hợp với mục tiêu vận hành.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg">
            <form className="space-y-10 p-10" onSubmit={handleSubmit}>
              {/* Tên gói & trạng thái */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <label className="space-y-3">
                  <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Tên gói</span>
                  <input
                    className={inputClass}
                    placeholder="VD: Enterprise Plus"
                    value={formState.name}
                    onChange={handleChange("name")}
                    required
                    type="text"
                  />
                </label>
                <label className="space-y-3">
                  <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Trạng thái gói</span>
                  <select
                    className={inputClass}
                    value={formState.status}
                    onChange={handleChange("status")}
                  >
                    {BILLING_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status === "Active" ? "ĐANG HOẠT ĐỘNG" : "NGỪNG HOẠT ĐỘNG"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Mô tả */}
              <label className="space-y-3">
                <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Mô tả</span>
                <textarea
                  className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 resize-none"
                  placeholder="Mô tả ngắn đối tượng sử dụng hoặc lợi ích chính của gói"
                  value={formState.description}
                  onChange={handleChange("description")}
                  rows={4}
                />
              </label>

              {/* Cấu hình tài nguyên */}
              <div className="border-t border-slate-200 pt-8">
                <div className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  <Settings2 className="h-5 w-5 text-slate-500" />
                  Cấu hình tài nguyên
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                  <label className="space-y-3">
                    <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Giới hạn lưu trữ (GB)</span>
                    <div className="relative">
                      <input
                        className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500"
                          placeholder="VD: 500"
                        value={formState.storageLimit || ""}
                        onChange={handleChange("storageLimit")}
                        type="number"
                        inputMode="numeric"
                      />
                    </div>
                  </label>

                  <label className="space-y-3">
                    <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Người dùng tối đa</span>
                    <input
                      className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500"
                      placeholder="VD: 50"
                      value={formState.maxUsers || ""}
                      onChange={handleChange("maxUsers")}
                      type="number"
                      inputMode="numeric"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Chu kỳ thanh toán</span>
                    <select
                      className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900"
                      value={formState.billingCycle}
                      onChange={handleChange("billingCycle")}
                    >
                      {BILLING_CYCLES.map((cycle) => (
                        <option key={cycle} value={cycle}>
                          {(cycle === "Monthly" ? "Hàng tháng" : cycle === "Quarterly" ? "Hàng quý" : "Hàng năm").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-3">
                    <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Giá ($)</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                      <input
                        className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white pl-8 pr-4 py-3 text-slate-900 placeholder:text-slate-500"
                         placeholder="VD: 199.00"
                        value={formState.price || ""}
                        onChange={handleChange("price")}
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Tính năng */}
              <div className="border-t border-slate-200 pt-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                    <ShieldCheck className="h-5 w-5 text-slate-500" />
                    Quyền lợi & tính năng gói
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                    onClick={() => {
                      if (customFeature.trim()) {
                        handleFeatureToggle(customFeature.trim())
                        setCustomFeature("")
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm tính năng tùy chỉnh
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {DEFAULT_FEATURES.map((feature) => {
                    const selected = formState.features.includes(feature)
                    return (
                      <button
                        key={feature}
                        type="button"
                        className={`create-plan-feature group flex items-center gap-3 rounded-lg border px-4 py-4 text-left text-sm transition ${
                          selected
                            ? "border-blue-600 bg-blue-50 text-slate-950"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                        onClick={() => handleFeatureToggle(feature)}
                      >
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-sm border ${
                            selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-400"
                          }`}
                        >
                          {selected ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                        {feature}
                      </button>
                    )
                  })}
                </div>

                {/* Nhập tính năng tùy chỉnh */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-[1.7fr_0.9fr]">
                  <input
                    className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500"
                    placeholder="Thêm tính năng tùy chỉnh"
                    value={customFeature}
                    onChange={(event) => setCustomFeature(event.target.value)}
                    type="text"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold"
                    onClick={() => {
                      if (customFeature.trim()) {
                        handleFeatureToggle(customFeature.trim())
                        setCustomFeature("")
                      }
                    }}
                  >
                    Thêm tính năng
                  </Button>
                </div>

                {/* Hiển thị tính năng tùy chỉnh */}
                {formState.features.some((f) => !DEFAULT_FEATURES.includes(f)) && (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">Tính năng tùy chỉnh</p>
                    <div className="flex flex-wrap gap-2">
                      {formState.features
                        .filter((f) => !DEFAULT_FEATURES.includes(f))
                        .map((feature) => (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => handleFeatureToggle(feature)}
                            className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200 transition"
                          >
                            {feature}
                            <span className="font-bold">×</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Thao tác */}
              <div className="flex justify-end gap-4 border-t border-slate-200 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => navigate(-1)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-gradient-to-r from-blue-700 to-blue-900 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all hover:shadow-blue-700/30 disabled:opacity-70"
                >
                  {isSubmitting ? "Đang tạo..." : "Tạo & xuất bản gói"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
