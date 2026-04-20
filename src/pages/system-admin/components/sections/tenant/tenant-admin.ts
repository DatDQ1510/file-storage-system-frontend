import type {
  ITenantProvisionFormState,
  TTenantProvisionStep,
} from "@/pages/system-admin/components/sections/tenant/types"

export const TENANT_PROVISION_STEP_LABELS = [
  "Tạo tenant",
  "Tạo tài khoản quản trị",
  "Đăng ký gói & cấp phát",
] as const

export const INITIAL_TENANT_PROVISION_FORM_STATE: ITenantProvisionFormState = {
  companyName: "",
  subdomain: "",
  adminFullName: "",
  adminEmail: "",
  adminPhoneNumber: "",
  selectedPlanName: "Pro",
}

export const INITIAL_SUBDOMAIN_AVAILABILITY = null

export const isTenantProvisionStepOneValid = (
  formState: ITenantProvisionFormState
) => {
  return (
    Boolean(formState.companyName.trim()) &&
    Boolean(formState.subdomain.trim())
  )
}

export const isTenantProvisionStepTwoValid = (
  formState: ITenantProvisionFormState
) => {
  return (
    Boolean(formState.adminFullName.trim()) &&
    Boolean(formState.adminEmail.trim()) &&
    Boolean(formState.adminPhoneNumber.trim())
  )
}

export const getNextTenantProvisionStep = (
  currentStep: TTenantProvisionStep
): TTenantProvisionStep => {
  if (currentStep === 1) {
    return 2
  }

  if (currentStep === 2) {
    return 3
  }

  return 3
}

export const getPreviousTenantProvisionStep = (
  currentStep: TTenantProvisionStep
): TTenantProvisionStep => {
  if (currentStep === 3) {
    return 2
  }

  if (currentStep === 2) {
    return 1
  }

  return 1
}
