import { ArrowLeft, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminAccountStep } from "@/pages/system-admin/components/sections/tenant/components/AdminAccountStep"
import { PlanProvisionStep } from "@/pages/system-admin/components/sections/tenant/components/PlanProvisionStep"
import { StepIndicator } from "@/pages/system-admin/components/sections/tenant/components/StepIndicator"
import { TenantOrganizationStep } from "@/pages/system-admin/components/sections/tenant/components/TenantOrganizationStep"
import {
  TENANT_PROVISION_STEP_LABELS,
  isTenantProvisionStepOneValid,
  isTenantProvisionStepTwoValid,
} from "@/pages/system-admin/components/sections/tenant/tenant-admin"
import type { ITenantRegisterModalProps } from "@/pages/system-admin/components/sections/tenant/types"

export const TenantRegisterModal = ({
  isOpen,
  currentStep,
  formState,
  selectedPlan,
  subdomainAvailability,
  adminAvailability,
  isCheckingSubdomain,
  isCheckingAdminAvailability,
  isSubmitting,
  onClose,
  onBack,
  onNext,
  onChange,
  onSelectPlan,
  onSubmit,
}: ITenantRegisterModalProps) => {
  if (!isOpen) {
    return null
  }

  const isStepOneValid = isTenantProvisionStepOneValid(formState)
  const isStepTwoValid = isTenantProvisionStepTwoValid(formState)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-3 py-3 sm:px-4 sm:py-8">
      <button
        aria-label="Close tenant provisioning modal"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 my-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50" />

        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="relative space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Tenant Provision Wizard
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
              Create Organization, Admin, and Plan
            </h3>
            <p className="max-w-2xl text-sm text-slate-500">
              Complete the three-step flow, then submit one payload to provision
              the tenant, admin account, plan, and storage resources.
            </p>
          </div>

          <button
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative grid gap-3 border-b border-slate-200 px-5 py-4 sm:grid-cols-3 sm:px-6">
          {TENANT_PROVISION_STEP_LABELS.map((label, index) => (
            <StepIndicator
              key={label}
              step={(index + 1) as 1 | 2 | 3}
              currentStep={currentStep}
              label={label}
            />
          ))}
        </div>

        <form className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6" onSubmit={onSubmit}>
          <div className="space-y-5">
            {currentStep === 1 && (
              <TenantOrganizationStep
                formState={formState}
                subdomainAvailability={subdomainAvailability}
                isCheckingSubdomain={isCheckingSubdomain}
                onChange={onChange}
              />
            )}

            {currentStep === 2 && (
              <AdminAccountStep
                formState={formState}
                adminAvailability={adminAvailability}
                isCheckingAdminAvailability={isCheckingAdminAvailability}
                onChange={onChange}
              />
            )}

            {currentStep === 3 && (
              <PlanProvisionStep
                formState={formState}
                selectedPlan={selectedPlan}
                onSelectPlan={onSelectPlan}
              />
            )}
          </div>

          <div className="mt-1 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:mt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="gap-2 text-slate-600 sm:self-auto"
              onClick={onBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-600"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  className="bg-blue-700 text-white hover:bg-blue-800"
                  onClick={onNext}
                  disabled={isSubmitting || isCheckingSubdomain || isCheckingAdminAvailability}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  className="bg-blue-700 text-white hover:bg-blue-800"
                  type="submit"
                  disabled={
                    isSubmitting || !selectedPlan || !isStepTwoValid || !isStepOneValid
                  }
                >
                  {isSubmitting ? "Provisioning..." : "Register & Provision"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
