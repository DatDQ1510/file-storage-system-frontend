import { Users } from "lucide-react"
import { TENANT_PROVISION_PLANS } from "@/pages/system-admin/constants"
import type { ITenantProvisionPlan } from "@/pages/system-admin/types"

interface IPlanProvisionStepProps {
  selectedPlan: ITenantProvisionPlan
  plans: ITenantProvisionPlan[]
  isLoadingPlans: boolean
  onSelectPlan: (planName: string) => void
}

export const PlanProvisionStep = ({
  selectedPlan,
  plans,
  isLoadingPlans,
  onSelectPlan,
}: IPlanProvisionStepProps) => {
  const availablePlans = plans.length ? plans : TENANT_PROVISION_PLANS

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm sm:p-5">
      <div>
        <h4 className="text-lg font-semibold text-slate-900">Modal 3: Dang ky Goi Dich vu</h4>
        <p className="mt-1 text-sm text-slate-500">
          Chon goi dich vu va gui toan bo JSON mot lan de backend xu ly transaction, cap phat storage va phat hanh activation token.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        {isLoadingPlans ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
            Loading subscription plans...
          </div>
        ) : (
          availablePlans.map((plan) => {
            const isSelected = selectedPlan.name === plan.name

            return (
              <button
                key={plan.name}
                className={`flex h-full min-h-[180px] flex-col rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 shadow-sm shadow-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                onClick={() => onSelectPlan(plan.name)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{plan.name}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{plan.storageQuota}</p>
                  </div>
                  <div className={`rounded-full px-2 py-1 text-xs font-semibold ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {plan.maxUsers} users
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{plan.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  Maximum {plan.maxUsers} users
                </div>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}
