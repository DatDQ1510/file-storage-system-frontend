import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { CreditCard, ReceiptText, ShieldCheck, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import { loadArchivePlanCards, loadPlanCards, removeSubscriptionPlan } from "@/pages/system-admin/services/billing-service"
import type { IPlanCard } from "@/pages/system-admin/types"

const BILLING_SUMMARY = [
  { label: "Tốc độ doanh thu", value: "$2.4M", note: "Tăng trưởng quy đổi năm +24%", icon: TrendingUp },
  { label: "Gói đang áp dụng", value: "04", note: "Số bậc gói hiện hành", icon: CreditCard },
  { label: "Quy tắc thanh toán", value: "3", note: "Chính sách đang hoạt động", icon: ReceiptText },
  { label: "Sức khỏe thanh toán", value: "98%", note: "Không có lỗi nghiêm trọng", icon: ShieldCheck },
]

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

export const BillingSection = () => {
  const navigate = useNavigate()
  const [planCards, setPlanCards] = useState<IPlanCard[]>([])
  const [archivePlans, setArchivePlans] = useState<IPlanCard[]>([])
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active")
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)

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
  }, [loadPlans])

  const handleDelete = async (plan: IPlanCard) => {
    if (!plan.id) return
    const confirmed = window.confirm(`Bạn có chắc muốn xóa gói "${plan.name}"?`)
    if (!confirmed) return

    setDeletingPlanId(plan.id)
    try {
      await removeSubscriptionPlan(plan.id)
      await loadPlans()
    } catch (error) {
      console.error(error)
    } finally {
      setDeletingPlanId(null)
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
                            navigate(ROUTES.SYSTEM_ADMIN_PLAN_DETAIL.replace(":planId", plan.id))
                          }}
                        >
                        Xem
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        disabled={!plan.id || deletingPlanId === plan.id}
                        onClick={() => void handleDelete(plan)}
                      >
                        {deletingPlanId === plan.id ? "..." : "Xóa"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  )
}
