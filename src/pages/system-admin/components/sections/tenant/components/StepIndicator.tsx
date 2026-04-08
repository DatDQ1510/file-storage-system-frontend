import { CheckCircle2 } from "lucide-react"
import type { TTenantProvisionStep } from "@/pages/system-admin/components/sections/tenant/types"

interface IStepIndicatorProps {
  step: TTenantProvisionStep
  currentStep: TTenantProvisionStep
  label: string
}

export const StepIndicator = ({
  step,
  currentStep,
  label,
}: IStepIndicatorProps) => {
  const isActive = currentStep === step
  const isCompleted = currentStep > step

  return (
    <div
      className={`flex min-h-16 items-center gap-3 rounded-2xl border px-3 py-2 transition ${
        isActive
          ? "border-[#85B8FF] bg-[#E9F2FF] text-[#09326C]"
          : isCompleted
            ? "border-[#BAF3DB] bg-[#DCFFF1] text-[#164B35]"
            : "border-[#DFE1E6] bg-[#F7F8F9] text-[#626F86]"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
          isActive
            ? "bg-[#0C66E4] text-white"
            : isCompleted
              ? "bg-[#1F845A] text-white"
              : "bg-[#C7D1DB] text-[#44546F]"
        }`}
      >
        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#44546F]">Step {step}</p>
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  )
}
