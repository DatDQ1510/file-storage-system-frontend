import type { ChangeEvent, FormEvent } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { INewPlanInput, TBillingCycle, TBillingStatus } from "@/pages/system-admin/types"

interface ICreatePlanModalProps {
  isOpen: boolean
  formState: INewPlanInput
  customFeature: string
  onClose: () => void
  onChange: <K extends keyof INewPlanInput>(
    field: K
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onFeatureToggle: (feature: string) => void
  onCustomFeatureChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const BILLING_CYCLES: TBillingCycle[] = ["Monthly", "Quarterly", "Yearly"]
const BILLING_STATUS: TBillingStatus[] = ["Active", "Inactive"]
const DEFAULT_FEATURES = [
  "SSO Authentication",
  "API Access",
  "24/7 Priority Support",
  "Advanced Analytics",
  "Custom Domain",
  "Audit Logs",
]

export const CreatePlanModal = ({
  isOpen,
  formState,
  customFeature,
  onClose,
  onChange,
  onFeatureToggle,
  onCustomFeatureChange,
  onSubmit,
}: ICreatePlanModalProps) => {
  if (!isOpen) {
    return null
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-4 sm:py-8">
      <button
        aria-label="Close create plan modal"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Create New Subscription Plan</h3>
            <p className="mt-1 text-sm text-slate-500">Define a new tier with resources, features, and pricing.</p>
          </div>
          <button
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="grid max-h-[calc(100vh-9rem)] gap-4 overflow-y-auto px-6 py-5 md:max-h-[calc(100vh-11rem)] md:grid-cols-2"
          onSubmit={onSubmit}
        >
          {/* Plan Name & Status */}
          <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Plan Name</span>
              <input
                className={inputClass}
                placeholder="e.g., Enterprise Plus"
                value={formState.name}
                onChange={onChange("name")}
                required
                type="text"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select className={inputClass} value={formState.status} onChange={onChange("status")}>
                {BILLING_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Description */}
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              className="h-20 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-600 resize-none"
              placeholder="Briefly describe the plan"
              value={formState.description}
              onChange={onChange("description")}
            />
          </label>

          {/* Resource Configuration */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 md:col-span-2">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Resource Configuration</h4>
            <div className="grid gap-3 md:grid-cols-4">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Storage (GB)</span>
                <input
                  className={inputClass}
                  placeholder="500"
                  value={formState.storageLimit}
                  onChange={onChange("storageLimit")}
                  type="number"
                  inputMode="numeric"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Max Users</span>
                <input
                  className={inputClass}
                  placeholder="50"
                  value={formState.maxUsers}
                  onChange={onChange("maxUsers")}
                  type="number"
                  inputMode="numeric"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Billing Cycle</span>
                <select className={inputClass} value={formState.billingCycle} onChange={onChange("billingCycle")}>
                  {BILLING_CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>
                      {cycle}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Price ($)</span>
                <input
                  className={inputClass}
                  placeholder="199.00"
                  value={formState.price}
                  onChange={onChange("price")}
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                />
              </label>
            </div>
          </div>

          {/* Features */}
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Features</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                onClick={() => {
                  if (customFeature.trim()) {
                    onFeatureToggle(customFeature.trim())
                    onCustomFeatureChange("")
                  }
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Custom
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {DEFAULT_FEATURES.map((feature) => {
                const selected = formState.features.includes(feature)
                return (
                  <button
                    key={feature}
                    type="button"
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selected ? "border-blue-600 bg-blue-50 text-slate-950" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                    onClick={() => onFeatureToggle(feature)}
                  >
                    <input type="checkbox" checked={selected} readOnly className="h-4 w-4 cursor-pointer" />
                    <span>{feature}</span>
                  </button>
                )
              })}
            </div>

            {/* Custom Feature Input */}
            <div className="mt-3 flex gap-2">
              <input
                className={inputClass}
                placeholder="Custom feature name"
                value={customFeature}
                onChange={(event) => onCustomFeatureChange(event.target.value)}
                type="text"
              />
              <Button
                type="button"
                variant="outline"
                className="border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                onClick={() => {
                  if (customFeature.trim()) {
                    onFeatureToggle(customFeature.trim())
                    onCustomFeatureChange("")
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-xs text-blue-800 md:col-span-2">
            The plan will be created with the specified name, status, resources, and features. All settings can be modified later.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 md:col-span-2">
            <Button type="button" variant="ghost" className="text-slate-600" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-blue-700 text-white hover:bg-blue-800" type="submit">
              Create Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
