import type { ChangeEvent, FormEvent } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ITenantCreateInput, TTenantStatus } from "@/pages/system-admin/types"

interface ITenantRegisterModalProps {
  isOpen: boolean
  formState: Omit<ITenantCreateInput, "extraStorageSize"> & {
    extraStorageSize: string
  }
  onClose: () => void
  onChange: <K extends keyof ITenantCreateInput>(field: K) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const TENANT_PLAN_OPTIONS = ["Free", "Professional", "Enterprise", "Enterprise Plus", "Custom"]
const TENANT_REGION_OPTIONS = [
  "Asia-Pacific (Tokyo)",
  "Asia-Pacific (Singapore)",
  "Europe (Frankfurt)",
  "US-East (Virginia)",
]
const TENANT_STORAGE_UNITS = ["GB", "TB"] as const

export const TenantRegisterModal = ({
  isOpen,
  formState,
  onClose,
  onChange,
  onSubmit,
}: ITenantRegisterModalProps) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close register tenant modal"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Register New Tenant</h3>
            <p className="mt-1 text-sm text-slate-500">Create a tenant workspace, assign an initial plan, and set the primary admin contact.</p>
          </div>
          <button
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="grid gap-4 px-6 py-5 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Tenant Name</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
              placeholder="e.g. Acme Corporation"
              value={formState.businessName}
              onChange={onChange("businessName")}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Tenant Domain</span>
            <div className="relative">
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-32 text-sm outline-none focus:border-blue-600"
                placeholder="acme-corp"
                value={formState.nodeCode}
                onChange={onChange("nodeCode")}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">.sovereign.io</span>
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Storage Allocation</span>
            <div className="flex gap-2">
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                placeholder="0"
                type="number"
                min={0}
                value={formState.extraStorageSize}
                onChange={onChange("extraStorageSize")}
              />
              <select
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
                value={formState.storageUnit}
                onChange={onChange("storageUnit")}
              >
                {TENANT_STORAGE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Tenant Status</span>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
              value={formState.status}
              onChange={onChange("status")}
            >
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Suspended">Suspended</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Admin Name</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
              placeholder="Primary admin name"
              value={formState.adminName}
              onChange={onChange("adminName")}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Admin Email</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
              placeholder="admin@company.com"
              type="email"
              value={formState.adminEmail}
              onChange={onChange("adminEmail")}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Plan</span>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
              value={formState.plan}
              onChange={onChange("plan")}
            >
              {TENANT_PLAN_OPTIONS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Region</span>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-600"
              value={formState.region}
              onChange={onChange("region")}
            >
              {TENANT_REGION_OPTIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
            The tenant will be created with status Trial, zero quota usage, and the selected admin will receive the invite email.
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="ghost" className="text-slate-600" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-blue-700 text-white hover:bg-blue-800" type="submit">
              Register Tenant
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
