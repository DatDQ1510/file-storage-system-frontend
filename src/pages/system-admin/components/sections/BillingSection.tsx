import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { CreditCard, ReceiptText, ShieldCheck, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { loadArchivePlanCards, loadPlanCards } from "@/pages/system-admin/services/billing-service"
import type { INewPlanInput, IPlanCard } from "@/pages/system-admin/types"

const BILLING_SUMMARY = [
  { label: "Revenue Run Rate", value: "$2.4M", note: "Annualized growth +24%", icon: TrendingUp },
  { label: "Active Plans", value: "04", note: "Current published tiers", icon: CreditCard },
  { label: "Billing Rules", value: "3", note: "Policy controls active", icon: ReceiptText },
  { label: "Payment Health", value: "98%", note: "No critical failures", icon: ShieldCheck },
]

const getStorageLimit = (plan: IPlanCard) => {
  const name = plan.name.toLowerCase()
  if (name.includes("starter")) return "50 GB"
  if (name.includes("professional")) return "500 GB"
  if (name.includes("enterprise")) return "Unlimited"
  return "Flexible"
}

const getMaxUsers = (plan: IPlanCard) => {
  const name = plan.name.toLowerCase()
  if (name.includes("starter")) return "5 Users"
  if (name.includes("professional")) return "25 Users"
  if (name.includes("enterprise")) return "Unlimited"
  return "Custom"
}

interface IBillingSectionProps {
  isCreatePlanOpen: boolean
  createPlanForm: INewPlanInput
  customFeature: string
  onCloseCreatePlan: () => void
  onChangeCreatePlanForm: <K extends keyof INewPlanInput>(
    field: K
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onToggleFeature: (feature: string) => void
  onChangeCustomFeature: (value: string) => void
}

export const BillingSection = ({
  isCreatePlanOpen,
  createPlanForm,
  customFeature,
  onCloseCreatePlan,
  onChangeCreatePlanForm,
  onToggleFeature,
  onChangeCustomFeature,
}: IBillingSectionProps) => {
  const [planCards, setPlanCards] = useState<IPlanCard[]>([])
  const [archivePlans, setArchivePlans] = useState<IPlanCard[]>([])
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active")

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const [plans, archived] = await Promise.all([loadPlanCards(), loadArchivePlanCards()])
        setPlanCards(plans)
        setArchivePlans(archived)
      } catch (error) {
        console.error(error)
      }
    }

    void loadPlans()
  }, [])

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
            <CardTitle className="text-lg font-semibold text-slate-900">Subscription Plans Management</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Manage service tiers, pricing, and resource limits for your tenants.</p>
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
              Active Plans
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
              Inactive Plans
            </button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3">Plan Name</th>
                <th className="py-3">Price (USD)</th>
                <th className="py-3">Billing Cycle</th>
                <th className="py-3">Storage Limit</th>
                <th className="py-3">Max Users</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === "active" ? planCards : archivePlans).map((plan) => (
                <tr key={plan.name} className="border-b border-slate-100 last:border-none">
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
                      {activeTab === "active" ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Button size="icon-sm" variant="ghost" className="text-slate-500">
                      View
                    </Button>
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
