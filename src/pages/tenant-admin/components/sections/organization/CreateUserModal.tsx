import { useMemo, useState } from "react"
import { Eye, EyeOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ICreateTenantUserRequest } from "@/pages/tenant-admin/types"

interface ICreateUserModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: ICreateTenantUserRequest) => Promise<void>
}

const INITIAL_CREATE_USER_FORM_STATE: ICreateTenantUserRequest = {
  userName: "",
  email: "",
  password: "",
  phoneNumber: "",
  department: "",
}

const DEFAULT_DEPARTMENTS = [
  "Kỹ thuật",
  "Sản phẩm",
  "Thiết kế",
  "Marketing",
  "Kinh doanh",
  "Vận hành",
  "Tài chính",
  "Nhân sự",
  "Chăm sóc khách hàng",
  "Hỗ trợ CNTT",
]

export const CreateUserModal = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: ICreateUserModalProps) => {
  const [formState, setFormState] = useState<ICreateTenantUserRequest>(
    INITIAL_CREATE_USER_FORM_STATE
  )
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const canSubmit = useMemo(() => {
    return Boolean(
      formState.userName.trim() &&
        formState.email.trim() &&
        formState.password.trim() &&
        formState.password.length >= 6 &&
        formState.userName.length <= 100 &&
        formState.email.length <= 255
    )
  }, [formState])

  if (!isOpen) {
    return null
  }

  const handleClose = () => {
    if (isSubmitting) {
      return
    }

    setErrorMessage("")
    onClose()
  }

  const handleChange = (
    field: keyof ICreateTenantUserRequest,
    value: string
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    const normalizedInput: ICreateTenantUserRequest = {
      userName: formState.userName.trim(),
      email: formState.email.trim(),
      password: formState.password,
      phoneNumber: formState.phoneNumber.trim(),
      department: formState.department.trim(),
    }

    if (!normalizedInput.userName) {
      setErrorMessage("Tên người dùng là bắt buộc.")
      return
    }

    if (normalizedInput.userName.length > 100) {
      setErrorMessage("Tên người dùng tối đa 100 ký tự.")
      return
    }

    if (!normalizedInput.email) {
      setErrorMessage("Email là bắt buộc.")
      return
    }

    if (normalizedInput.email.length > 255) {
      setErrorMessage("Email tối đa 255 ký tự.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedInput.email)) {
      setErrorMessage("Định dạng email không hợp lệ.")
      return
    }

    if (!normalizedInput.password) {
      setErrorMessage("Mật khẩu là bắt buộc.")
      return
    }

    if (normalizedInput.password.length < 6 || normalizedInput.password.length > 100) {
      setErrorMessage("Mật khẩu phải có từ 6 đến 100 ký tự.")
      return
    }

    setErrorMessage("")
    await onSubmit(normalizedInput)
    setFormState(INITIAL_CREATE_USER_FORM_STATE)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={handleClose}
        aria-label="Đóng hộp thoại tạo người dùng"
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-2xl font-semibold text-slate-900">Tạo người dùng mới</h3>
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Tên người dùng *</label>
            <input
              value={formState.userName}
              onChange={(event) => handleChange("userName", event.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              maxLength={100}
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-cyan-500"
            />
            <p className="mt-1 text-right text-xs text-slate-400">Tối đa 100 ký tự</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Địa chỉ email *</label>
            <input
              value={formState.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="john.smith@company.com"
              maxLength={255}
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Mật khẩu *</label>
              <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3">
                <input
                  value={formState.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="******"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                />
                <button
                    type="button"
                    className="text-slate-500"
                    onClick={() => setIsPasswordVisible((current) => !current)}
                    aria-label="Bật/tắt hiển thị mật khẩu"
                  >
                  {isPasswordVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-800">Số điện thoại</label>
              <input
                value={formState.phoneNumber}
                onChange={(event) => handleChange("phoneNumber", event.target.value)}
                placeholder="+84 900 000 000"
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Phòng ban</label>
            <select
              value={formState.department}
              onChange={(event) => handleChange("department", event.target.value)}
              aria-label="Chọn phòng ban"
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-cyan-500"
            >
              <option value="">Chọn phòng ban...</option>
              {DEFAULT_DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Người dùng sẽ nhận email mời để hoàn tất kích hoạt tài khoản.
          </p>

          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="button"
            className="bg-cyan-700 text-white hover:bg-cyan-800"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo người dùng"}
          </Button>
        </div>
      </div>
    </div>
  )
}
