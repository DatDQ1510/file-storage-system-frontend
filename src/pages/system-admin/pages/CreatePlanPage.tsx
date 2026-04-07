import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"
import { useNavigate } from "react-router"
import { Check, ChevronLeft, Plus, Settings2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addPlanCard } from "@/pages/system-admin/services/billing-service"
import type { INewPlanInput, TBillingCycle, TBillingStatus } from "@/pages/system-admin/types"

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
      await addPlanCard(formState)
      navigate(-1)
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
            Back to Billing
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">Create New Subscription Plan</h1>
            <p className="text-base text-slate-600">
              Define a new tier for the Sovereign Architect ecosystem. Ensure all resource limits are balanced.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg">
            <form className="space-y-10 p-10" onSubmit={handleSubmit}>
              {/* Plan Name & Status */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <label className="space-y-3">
                  <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Plan Name</span>
                  <input
                    className={inputClass}
                    placeholder="e.g., Enterprise Plus"
                    value={formState.name}
                    onChange={handleChange("name")}
                    required
                    type="text"
                  />
                </label>
                <label className="space-y-3">
                  <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Plan Status</span>
                  <select
                    className={inputClass}
                    value={formState.status}
                    onChange={handleChange("status")}
                  >
                    {BILLING_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Description */}
              <label className="space-y-3">
                <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Description</span>
                <textarea
                  className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 resize-none"
                  placeholder="Briefly describe the target audience or key benefits"
                  value={formState.description}
                  onChange={handleChange("description")}
                  rows={4}
                />
              </label>

              {/* Resource Configuration */}
              <div className="border-t border-slate-200 pt-8">
                <div className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  <Settings2 className="h-5 w-5 text-slate-500" />
                  Resource Configuration
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                  <label className="space-y-3">
                    <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Storage Limit (GB)</span>
                    <div className="relative">
                      <input
                        className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500"
                        placeholder="e.g., 500"
                        value={formState.storageLimit || ""}
                        onChange={handleChange("storageLimit")}
                        type="number"
                        inputMode="numeric"
                      />
                    </div>
                  </label>

                  <label className="space-y-3">
                    <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Max Users</span>
                    <input
                      className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500"
                      placeholder="e.g., 50"
                      value={formState.maxUsers || ""}
                      onChange={handleChange("maxUsers")}
                      type="number"
                      inputMode="numeric"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Billing Cycle</span>
                    <select
                      className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900"
                      value={formState.billingCycle}
                      onChange={handleChange("billingCycle")}
                    >
                      {BILLING_CYCLES.map((cycle) => (
                        <option key={cycle} value={cycle}>
                          {cycle.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-3">
                    <span className="block text-sm font-bold uppercase tracking-wider text-slate-600">Price ($)</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                      <input
                        className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white pl-8 pr-4 py-3 text-slate-900 placeholder:text-slate-500"
                        placeholder="e.g., 199.00"
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

              {/* Features */}
              <div className="border-t border-slate-200 pt-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                    <ShieldCheck className="h-5 w-5 text-slate-500" />
                    Plan Entitlements & Features
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
                    Add Custom Feature
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

                {/* Custom Feature Input */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-[1.7fr_0.9fr]">
                  <input
                    className="create-plan-input w-full rounded-t-md border-b-2 border-transparent border-b-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500"
                    placeholder="Add a custom feature"
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
                    Add Feature
                  </Button>
                </div>

                {/* Display custom features */}
                {formState.features.some((f) => !DEFAULT_FEATURES.includes(f)) && (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">Custom Features</p>
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

              {/* Actions */}
              <div className="flex justify-end gap-4 border-t border-slate-200 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-gradient-to-r from-blue-700 to-blue-900 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all hover:shadow-blue-700/30 disabled:opacity-70"
                >
                  {isSubmitting ? "Creating..." : "Create & Publish Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
