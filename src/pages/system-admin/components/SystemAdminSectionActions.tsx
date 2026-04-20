import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TSystemSection } from "@/pages/system-admin/types"

interface ISystemAdminSectionActionsProps {
  activeSection: TSystemSection
  onOpenRegisterTenant: () => void
  onCreatePlan?: () => void
}

export const SystemAdminSectionActions = ({
  activeSection,
  onOpenRegisterTenant,
  onCreatePlan,
}: ISystemAdminSectionActionsProps) => {
  if (activeSection === "tenants") {
    return (
      <div className="flex flex-wrap items-center gap-2">

        <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={onOpenRegisterTenant}>
          <Plus className="h-4 w-4" />
          Đăng ký tenant mới
        </Button>
      </div>
    )
  }

  if (activeSection === "billing") {
    return (
      <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={onCreatePlan}>
        + Tạo gói mới
      </Button>
    )
  }

  return null
}
