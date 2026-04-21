import { type ChangeEvent, type FormEvent, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import type { ISubscriptionPlanResponse } from "@/pages/system-admin/api/billing-api"
import {
  createSubscriptionPlanFromInput,
  getSubscriptionPlanDetail,
  removeSubscriptionPlan,
  updateSubscriptionPlanFromInput,
} from "@/pages/system-admin/services/billing-service"
import type { INewPlanInput, TBillingCycle, TBillingStatus } from "@/pages/system-admin/types"

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

export const PlanDetailPage = () => {
  const navigate = useNavigate()
  const { planId } = useParams<{ planId: string }>()
  const [editForm, setEditForm] = useState<INewPlanInput>(emptyForm)
  const [createForm, setCreateForm] = useState<INewPlanInput>(emptyForm)
  const [editFeaturesText, setEditFeaturesText] = useState("")
  const [createFeaturesText, setCreateFeaturesText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!planId) return

    const loadPlan = async () => {
      try {
        const plan = await getSubscriptionPlanDetail(planId)
        const mapped = mapPlanResponseToForm(plan)
        setEditForm(mapped)
        setEditFeaturesText(mapped.features.join(", "))
      } finally {
        setIsLoading(false)
      }
    }

    void loadPlan()
  }, [planId])

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

  const handleCreateChange =
    <K extends keyof INewPlanInput>(field: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = event.target
      setCreateForm((prev) => ({
        ...prev,
        [field]:
          target.type === "number"
            ? Number(target.value)
            : target.value,
      }))
    }

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!planId) return
    setIsSaving(true)
    try {
      const payload = { ...editForm, features: toFeaturesArray(editFeaturesText) }
      const updated = await updateSubscriptionPlanFromInput(planId, payload)
      const mapped = mapPlanResponseToForm(updated)
      setEditForm(mapped)
      setEditFeaturesText(mapped.features.join(", "))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreating(true)
    try {
      const payload = { ...createForm, features: toFeaturesArray(createFeaturesText) }
      const created = await createSubscriptionPlanFromInput(payload)
      navigate(ROUTES.SYSTEM_ADMIN_PLAN_DETAIL.replace(":planId", created.id))
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!planId) return
    const confirmed = window.confirm("Bạn có chắc muốn xóa gói cước này?")
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await removeSubscriptionPlan(planId)
      navigate(`${ROUTES.SYSTEM_ADMIN_DASHBOARD}?section=billing`)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!planId) {
    return <div className="p-6 text-sm text-red-600">Thiếu planId.</div>
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-600">Đang tải chi tiết gói...</div>
  }

  const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate(`${ROUTES.SYSTEM_ADMIN_DASHBOARD}?section=billing`)}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-700 hover:opacity-85"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại gói cước
        </button>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-950">Chi tiết gói cước</h1>
            <p className="mt-1 text-sm text-slate-500">Chỉnh sửa và cập nhật thông tin gói hiện tại.</p>

            <form className="mt-5 space-y-4" onSubmit={handleUpdate}>
              <input className={inputClass} value={editForm.name} onChange={handleEditChange("name")} placeholder="Tên gói" />
              <textarea className={`${inputClass} min-h-24`} value={editForm.description} onChange={handleEditChange("description")} placeholder="Mô tả" />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} value={editForm.storageLimit} onChange={handleEditChange("storageLimit")} type="number" placeholder="Storage (GB)" />
                <input className={inputClass} value={editForm.maxUsers} onChange={handleEditChange("maxUsers")} type="number" placeholder="Max users" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className={inputClass} value={editForm.billingCycle} onChange={handleEditChange("billingCycle")}>
                  {BILLING_CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>{cycle}</option>
                  ))}
                </select>
                <select className={inputClass} value={editForm.status} onChange={handleEditChange("status")}>
                  {BILLING_STATUS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <input className={inputClass} value={editForm.price} onChange={handleEditChange("price")} type="number" step="0.01" placeholder="Giá (USD)" />
              <textarea
                className={`${inputClass} min-h-20`}
                value={editFeaturesText}
                onChange={(event) => setEditFeaturesText(event.target.value)}
                placeholder="Features, cách nhau bằng dấu phẩy"
              />

              <div className="flex items-center justify-between">
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Đang lưu..." : "Lưu chỉnh sửa"}
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Đang xóa..." : "Xóa gói"}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Thêm gói mới</h2>
            <p className="mt-1 text-sm text-slate-500">Tạo nhanh một gói cước mới ngay tại trang detail.</p>

            <form className="mt-5 space-y-4" onSubmit={handleCreate}>
              <input className={inputClass} value={createForm.name} onChange={handleCreateChange("name")} placeholder="Tên gói" required />
              <textarea className={`${inputClass} min-h-24`} value={createForm.description} onChange={handleCreateChange("description")} placeholder="Mô tả" />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} value={createForm.storageLimit} onChange={handleCreateChange("storageLimit")} type="number" placeholder="Storage (GB)" />
                <input className={inputClass} value={createForm.maxUsers} onChange={handleCreateChange("maxUsers")} type="number" placeholder="Max users" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className={inputClass} value={createForm.billingCycle} onChange={handleCreateChange("billingCycle")}>
                  {BILLING_CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>{cycle}</option>
                  ))}
                </select>
                <select className={inputClass} value={createForm.status} onChange={handleCreateChange("status")}>
                  {BILLING_STATUS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <input className={inputClass} value={createForm.price} onChange={handleCreateChange("price")} type="number" step="0.01" placeholder="Giá (USD)" />
              <textarea
                className={`${inputClass} min-h-20`}
                value={createFeaturesText}
                onChange={(event) => setCreateFeaturesText(event.target.value)}
                placeholder="Features, cách nhau bằng dấu phẩy"
              />
              <Button type="submit" disabled={isCreating}>
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? "Đang tạo..." : "Tạo gói mới"}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
