import { type ChangeEvent, type FormEvent, useCallback, useEffect, useState } from "react"
import { CreditCard, Pencil, ReceiptText, Trash, ShieldCheck, TrendingUp, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ISubscriptionPlanResponse } from "@/pages/system-admin/api/billing-api"
import {
  getSubscriptionPlanDetail,
  loadArchivePlanCards,
  loadPlanCards,
  removeSubscriptionPlan,
  updateSubscriptionPlanFromInput,
} from "@/pages/system-admin/services/billing-service"
import type { IPlanCard, INewPlanInput, TBillingCycle, TBillingStatus } from "@/pages/system-admin/types"

const BILLING_SUMMARY = [
  { label: "Tốc độ doanh thu", value: "$2.4M", note: "Tăng trưởng quy đổi năm +24%", icon: TrendingUp },
  { label: "Gói đang áp dụng", value: "04", note: "Số bậc gói hiện hành", icon: CreditCard },
  { label: "Quy tắc thanh toán", value: "3", note: "Chính sách đang hoạt động", icon: ReceiptText },
  { label: "Sức khỏe thanh toán", value: "98%", note: "Không có lỗi nghiêm trọng", icon: ShieldCheck },
]

const BILLING_CYCLES: TBillingCycle[] = ["Monthly", "Quarterly", "Yearly"]
const BILLING_STATUS: TBillingStatus[] = ["Active", "Inactive"]

const emptyForm = (): INewPlanInput => ({
  name: "",
  status: "Active",
  description: "",
  storageLimit: 0,
  maxUsers: 0,
  billingCycle: "Monthly",
  price: 0,
  features: [],
})

const toBillingCycle = (value: string): TBillingCycle => {
  if (value === "QUARTERLY") return "Quarterly"
  if (value === "YEARLY") return "Yearly"
  return "Monthly"
}

const toBillingStatus = (value?: string): TBillingStatus => {
  return value === "INACTIVE" ? "Inactive" : "Active"
}

const mapPlanResponseToForm = (plan: ISubscriptionPlanResponse): INewPlanInput => ({
  name: plan.namePlan,
  status: toBillingStatus(plan.planStatus),
  description: plan.description ?? "",
  storageLimit: Number(plan.baseStorageLimit),
  maxUsers: plan.maxUsers,
  billingCycle: toBillingCycle(plan.billingCycle),
  price: plan.price,
  features: plan.features ? Object.keys(plan.features) : [],
})

const toFeaturesArray = (value: string) => {
  return value
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean)
}

const getStorageLimit = (plan: IPlanCard) => {
  if (plan.storageLimit !== undefined) {
    if (typeof plan.storageLimit === "number") {
      return `${plan.storageLimit} GB`
    }
    return plan.storageLimit
  }

  const name = plan.name.toLowerCase()
  if (name.includes("starter")) return "50 GB"
  if (name.includes("professional")) return "500 GB"
    if (name.includes("enterprise")) return "Không giới hạn"
    return "Linh hoạt"
}

const getMaxUsers = (plan: IPlanCard) => {
  if (plan.maxUsers !== undefined) {
    if (typeof plan.maxUsers === "number") {
      return `${plan.maxUsers} người dùng`
    }
    return plan.maxUsers
  }

  const name = plan.name.toLowerCase()
  if (name.includes("starter")) return "5 người dùng"
  if (name.includes("professional")) return "25 người dùng"
  if (name.includes("enterprise")) return "Không giới hạn"
  return "Tùy chỉnh"
}

interface IBillingSectionProps {
  refreshToken?: number
}

export const BillingSection = ({ refreshToken = 0 }: IBillingSectionProps) => {
  const [planCards, setPlanCards] = useState<IPlanCard[]>([])
  const [archivePlans, setArchivePlans] = useState<IPlanCard[]>([])
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active")
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)
  const [planPendingDelete, setPlanPendingDelete] = useState<IPlanCard | null>(null)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false)
  const [isLoadingEditData, setIsLoadingEditData] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState<INewPlanInput>(emptyForm)
  const [editFeaturesText, setEditFeaturesText] = useState("")

  const loadPlans = useCallback(async () => {
    try {
      const [plans, archived] = await Promise.all([loadPlanCards(), loadArchivePlanCards()])
      setPlanCards(plans)
      setArchivePlans(archived)
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    void loadPlans()
  }, [loadPlans, refreshToken])

  const handleDelete = async (plan: IPlanCard) => {
    if (!plan.id) return

    setDeletingPlanId(plan.id)
    try {
      await removeSubscriptionPlan(plan.id)
      await loadPlans()
      toast.success(`Xóa gói "${plan.name}" thành công`)
    } catch (error) {
      console.error(error)
    } finally {
      setDeletingPlanId(null)
      setPlanPendingDelete(null)
    }
  }

  const handleOpenDeleteDialog = (plan: IPlanCard) => {
    if (!plan.id) return
    setPlanPendingDelete(plan)
  }

  const handleEditChange =
    <K extends keyof INewPlanInput>(field: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = event.target
      setEditForm((prev) => ({
        ...prev,
        [field]:
          target.type === "number"
            ? Number(target.value)
            : target.value,
      }))
    }

  const handleOpenEdit = async (planId: string) => {
    setIsEditingModalOpen(true)
    setEditingPlanId(planId)
    setIsLoadingEditData(true)

    try {
      const plan = await getSubscriptionPlanDetail(planId)
      const mapped = mapPlanResponseToForm(plan)
      setEditForm(mapped)
      setEditFeaturesText(mapped.features.join(", "))
    } catch (error) {
      console.error(error)
      setIsEditingModalOpen(false)
      setEditingPlanId(null)
    } finally {
      setIsLoadingEditData(false)
    }
  }

  const handleCloseEdit = () => {
    setIsEditingModalOpen(false)
    setEditingPlanId(null)
    setEditForm(emptyForm())
    setEditFeaturesText("")
    setIsLoadingEditData(false)
  }

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingPlanId) return

    setIsSavingEdit(true)
    try {
      await updateSubscriptionPlanFromInput(editingPlanId, {
        ...editForm,
        features: toFeaturesArray(editFeaturesText),
      })
      await loadPlans()
      toast.success("Cập nhật gói dịch vụ thành công")
      handleCloseEdit()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {BILLING_SUMMARY.map((summary) => (
          <Card key={summary.label} className="border-slate-200 bg-white/90 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{summary.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{summary.value}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{summary.note}</p>
              <summary.icon className="h-4 w-4 text-blue-700" />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Quản lý gói dịch vụ</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Quản lý bậc gói, mức giá và giới hạn tài nguyên cho tenant.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                activeTab === "active"
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              onClick={() => setActiveTab("active")}
            >
              Gói đang hoạt động
            </button>
            <button
              type="button"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                activeTab === "inactive"
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              onClick={() => setActiveTab("inactive")}
            >
              Gói ngừng hoạt động
            </button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3">Tên gói</th>
                <th className="py-3">Giá (USD)</th>
                <th className="py-3">Chu kỳ</th>
                <th className="py-3">Giới hạn lưu trữ</th>
                <th className="py-3">Người dùng tối đa</th>
                <th className="py-3">Trạng thái</th>
                <th className="py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === "active" ? planCards : archivePlans).map((plan) => (
                <tr key={plan.id ?? plan.name} className="border-b border-slate-100 last:border-none">
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">{plan.name}</p>
                    <p className="text-xs text-slate-500">{plan.tier}</p>
                  </td>
                  <td className="py-4 text-slate-700">{plan.price}</td>
                  <td className="py-4 text-slate-700">{plan.period}</td>
                  <td className="py-4 text-slate-700">{getStorageLimit(plan)}</td>
                  <td className="py-4 text-slate-700">{getMaxUsers(plan)}</td>
                  <td className="py-4">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      {activeTab === "active" ? "ĐANG HOẠT ĐỘNG" : "NGỪNG HOẠT ĐỘNG"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-slate-500"
                        disabled={!plan.id}
                        onClick={() => {
                          if (!plan.id) return
                          void handleOpenEdit(plan.id)
                        }}
                        aria-label={`Chỉnh sửa gói ${plan.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        disabled={!plan.id || deletingPlanId === plan.id}
                        onClick={() => handleOpenDeleteDialog(plan)}
                        aria-label={`Xóa gói ${plan.name}`}
                      >
                        {deletingPlanId === plan.id ? "..." : <Trash className="h-4 w-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isEditingModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <button
            aria-label="Đóng hộp thoại chỉnh sửa gói"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            type="button"
            onClick={handleCloseEdit}
          />

          <div className="relative z-10 my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Chỉnh sửa gói dịch vụ</h3>
                <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin gói và lưu thay đổi vào hệ thống.</p>
              </div>
              <button
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={handleCloseEdit}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isLoadingEditData ? (
              <div className="px-6 py-8 text-sm text-slate-600">Đang tải dữ liệu gói...</div>
            ) : (
              <form className="grid gap-4 px-6 py-5 md:grid-cols-2" onSubmit={handleSaveEdit}>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Tên gói</span>
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                    value={editForm.name}
                    onChange={handleEditChange("name")}
                    type="text"
                    required
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Mô tả</span>
                  <textarea
                    className="h-20 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-600"
                    value={editForm.description}
                    onChange={handleEditChange("description")}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Giới hạn lưu trữ (GB)</span>
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                    value={editForm.storageLimit}
                    onChange={handleEditChange("storageLimit")}
                    type="number"
                    inputMode="numeric"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Người dùng tối đa</span>
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                    value={editForm.maxUsers}
                    onChange={handleEditChange("maxUsers")}
                    type="number"
                    inputMode="numeric"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Chu kỳ thanh toán</span>
                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                    value={editForm.billingCycle}
                    onChange={handleEditChange("billingCycle")}
                  >
                    {BILLING_CYCLES.map((cycle) => (
                      <option key={cycle} value={cycle}>
                        {cycle === "Monthly" ? "Hàng tháng" : cycle === "Quarterly" ? "Hàng quý" : "Hàng năm"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Trạng thái</span>
                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                    value={editForm.status}
                    onChange={handleEditChange("status")}
                  >
                    {BILLING_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status === "Active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Giá (USD)</span>
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                    value={editForm.price}
                    onChange={handleEditChange("price")}
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Tính năng (phân tách bằng dấu phẩy)</span>
                  <textarea
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-600"
                    value={editFeaturesText}
                    onChange={(event) => setEditFeaturesText(event.target.value)}
                  />
                </label>

                <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 md:col-span-2">
                  <Button type="button" variant="ghost" className="text-slate-600" onClick={handleCloseEdit}>
                    Hủy
                  </Button>
                  <Button type="submit" className="bg-blue-700 text-white hover:bg-blue-800" disabled={isSavingEdit}>
                    {isSavingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {planPendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            aria-label="Đóng hộp thoại xác nhận xóa gói"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            type="button"
            onClick={() => {
              if (deletingPlanId) return
              setPlanPendingDelete(null)
            }}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Xác nhận xóa gói</h3>
              <p className="mt-1 text-sm text-slate-600">
                Bạn có chắc muốn xóa gói <span className="font-semibold text-slate-900">"{planPendingDelete.name}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-600"
                disabled={Boolean(deletingPlanId)}
                onClick={() => setPlanPendingDelete(null)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={Boolean(deletingPlanId)}
                onClick={() => void handleDelete(planPendingDelete)}
              >
                {deletingPlanId ? "Đang xóa..." : "Xóa gói"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
