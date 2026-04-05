import { Check, CreditCard, ReceiptText, ShieldCheck, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PLAN_CARDS } from "@/pages/system-admin/constants"
import { cn } from "@/lib/utils"

const BILLING_SUMMARY = [
  { label: "Revenue Run Rate", value: "$2.4M", note: "Annualized growth +24%", icon: TrendingUp },
  { label: "Active Plans", value: "1,246", note: "Tenants on paid tiers", icon: CreditCard },
  { label: "Billing Rules", value: "3", note: "Policy controls active", icon: ReceiptText },
  { label: "Payment Health", value: "98%", note: "No critical failures", icon: ShieldCheck },
]

export const BillingSection = () => {
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

      <section className="grid gap-4 xl:grid-cols-3">
        {PLAN_CARDS.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative border-slate-200 bg-white",
              plan.isHighlighted && "border-blue-600 ring-2 ring-blue-200"
            )}
          >
            {plan.isHighlighted && (
              <span className="absolute right-3 top-0 -translate-y-1/2 rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-white">
                MOST POPULAR
              </span>
            )}
            <CardHeader className="pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{plan.tier}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{plan.name}</CardTitle>
              <p className="text-5xl font-extrabold text-slate-900">
                {plan.price}
                <span className="text-base font-medium text-slate-500"> {plan.period}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.features.map((feature, index) => (
                <p
                  key={`${plan.name}-${feature}`}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    index === plan.features.length - 1 && !plan.isHighlighted && "text-slate-400"
                  )}
                >
                  <Check className="h-4 w-4 text-blue-600" />
                  {feature}
                </p>
              ))}

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                <span className="text-slate-500">{plan.tenants} Tenants</span>
                <Button variant={plan.isHighlighted ? "default" : "outline"} className="h-8">
                  Edit Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
              {[
                { label: "Free", height: 16, color: "bg-slate-300" },
                { label: "Professional", height: 72, color: "bg-blue-700" },
                { label: "Enterprise", height: 55, color: "bg-blue-600" },
                { label: "Custom", height: 40, color: "bg-blue-400" },
              ].map((bar) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className={cn("w-full rounded-t-sm", bar.color)} style={{ height: `${bar.height}%` }} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{bar.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Global Billing Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Automatic Prorating", description: "Adjust charges for partial month plan changes", enabled: true },
              { title: "Churn Alerts", description: "Notify admins for failed payment retries", enabled: true },
              { title: "Auto-Apply Credits", description: "Apply pending credits before invoice generation", enabled: false },
            ].map((rule) => (
              <div key={rule.title} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{rule.title}</p>
                  <p className="text-xs text-slate-500">{rule.description}</p>
                </div>
                <button
                  className={cn(
                    "h-6 w-11 rounded-full p-0.5 transition",
                    rule.enabled ? "bg-blue-600" : "bg-slate-300"
                  )}
                  type="button"
                >
                  <span
                    className={cn(
                      "block h-5 w-5 rounded-full bg-white transition",
                      rule.enabled ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            ))}

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <p className="font-semibold">Plan Sync Successful</p>
              <p className="text-xs">All 2,246 tenants updated to latest pricing tiers.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
