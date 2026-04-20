import { Loader2, Mail, Phone } from "lucide-react"
import type { ITenantProvisionFormState } from "@/pages/system-admin/components/sections/tenant/types"
import type { ITenantAdminAvailabilityResult } from "@/pages/system-admin/types"

interface IAdminAccountStepProps {
  formState: ITenantProvisionFormState
  adminAvailability: ITenantAdminAvailabilityResult | null
  isCheckingAdminAvailability: boolean
  onChange: <K extends keyof ITenantProvisionFormState>(
    field: K
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export const AdminAccountStep = ({
  formState,
  adminAvailability,
  isCheckingAdminAvailability,
  onChange,
}: IAdminAccountStepProps) => {
  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm sm:p-5">
      <div>
        <h4 className="text-lg font-semibold text-slate-900">Bước 2: Tài khoản quản trị</h4>
        <p className="mt-1 text-sm text-slate-500">
          Tạo tài khoản quản trị với thông tin định danh. Mật khẩu sẽ được thiết lập sau qua liên kết kích hoạt.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Họ tên</span>
          <input
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-600"
            placeholder="Nguyen Van A"
            value={formState.adminFullName}
            onChange={onChange("adminFullName")}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-600"
              placeholder="admin@company.com"
              type="email"
              value={formState.adminEmail}
              onChange={onChange("adminEmail")}
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-600"
              placeholder="+84 912 345 678"
              value={formState.adminPhoneNumber}
              onChange={onChange("adminPhoneNumber")}
            />
          </div>
        </label>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
        {isCheckingAdminAvailability ? (
            <div className="flex items-center gap-2 text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang kiểm tra email và số điện thoại...
            </div>
        ) : adminAvailability ? (
          <p className={adminAvailability.available ? "text-emerald-600" : "text-rose-600"}>
            {adminAvailability.message}
          </p>
        ) : (
          <p className="text-slate-500">Nhập email và số điện thoại hợp lệ để kiểm tra trùng lặp.</p>
        )}
      </div>

    </section>
  )
}
