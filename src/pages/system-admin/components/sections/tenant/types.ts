import type { ChangeEvent, FormEvent } from "react"
import type {
  ITenantAdminAvailabilityResult,
  ITenantProvisionPlan,
  ITenantSubdomainAvailabilityResult,
  TTenantProvisionPlanName,
} from "@/pages/system-admin/types"

export type TTenantProvisionStep = 1 | 2 | 3

export interface ITenantProvisionFormState {
  companyName: string
  subdomain: string
  adminFullName: string
  adminEmail: string
  adminPhoneNumber: string
  selectedPlanName: TTenantProvisionPlanName
}

export interface ITenantRegisterModalProps {
  isOpen: boolean
  currentStep: TTenantProvisionStep
  formState: ITenantProvisionFormState
  selectedPlan: ITenantProvisionPlan
  subdomainAvailability: ITenantSubdomainAvailabilityResult | null
  adminAvailability: ITenantAdminAvailabilityResult | null
  isCheckingSubdomain: boolean
  isCheckingAdminAvailability: boolean
  isSubmitting: boolean
  onClose: () => void
  onBack: () => void
  onNext: () => void
  onChange: <K extends keyof ITenantProvisionFormState>(
    field: K
  ) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSelectPlan: (planName: TTenantProvisionPlanName) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}
