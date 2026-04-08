import { Building2, Globe2, Loader2 } from "lucide-react"
import { normalizeSubdomainValue } from "@/helpers/validators/tenant-provision"
import type {
  ITenantProvisionFormState,
} from "@/pages/system-admin/components/sections/tenant/types"
import type { ITenantSubdomainAvailabilityResult } from "@/pages/system-admin/types"

interface ITenantOrganizationStepProps {
  formState: ITenantProvisionFormState
  subdomainAvailability: ITenantSubdomainAvailabilityResult | null
  isCheckingSubdomain: boolean
  onChange: <K extends keyof ITenantProvisionFormState>(
    field: K
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export const TenantOrganizationStep = ({
  formState,
  subdomainAvailability,
  isCheckingSubdomain,
  onChange,
}: ITenantOrganizationStepProps) => {
  const normalizedSubdomain = normalizeSubdomainValue(formState.subdomain)

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm sm:p-5">
      <div>
        <h4 className="text-lg font-semibold text-slate-900">Modal 1: Khoi tao To chuc</h4>
        <p className="mt-1 text-sm text-slate-500">
          Nhap ten to chuc va subdomain mong muon. Subdomain se duoc kiem tra tu dong sau khi nguoi dung ngung nhap.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Company Name</span>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-600"
              placeholder="e.g. Acme Corporation"
              value={formState.companyName}
              onChange={onChange("companyName")}
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Subdomain</span>
          <div className="relative">
            <Globe2 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-24 text-sm outline-none transition focus:border-blue-600"
              placeholder="doanhnghiep-a.storage.com"
              value={formState.subdomain}
              onChange={onChange("subdomain")}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              tenant URL
            </span>
          </div>
        </label>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
        {isCheckingSubdomain ? (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Dang kiem tra domain tenant...
          </div>
        ) : subdomainAvailability ? (
          <p className={subdomainAvailability.isAvailable ? "text-emerald-600" : "text-rose-600"}>
            {subdomainAvailability.message}
          </p>
        ) : (
          <p className="text-slate-500">
            {normalizedSubdomain
              ? "He thong se kiem tra domain tenant sau khi ban ngung nhap."
              : "Nhap subdomain hop le de thuc hien kiem tra."}
          </p>
        )}
      </div>

    </section>
  )
}
