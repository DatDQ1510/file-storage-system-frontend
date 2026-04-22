import {
  ChevronLeft,
  ChevronRight,
  Building2,
  CircleAlert,
  Blocks,
  CreditCard,
  FolderKanban,
  GitFork,
  Grid3X3,
  Link2,
  Receipt,
  Settings,
  Shield,
  Users,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { TENANT_NAV_GROUPS } from "@/pages/tenant-admin/constants"
import type { TTenantAdminSection } from "@/pages/tenant-admin/types"

interface ITenantSidebarProps {
  activeSection: TTenantAdminSection
  onSelectSection: (section: TTenantAdminSection) => void
}

const ICON_MAP = {
  grid_view: Grid3X3,
  group: Users,
  account_tree: GitFork,
  assignment: FolderKanban,
  security: Shield,
  link: Link2,
  credit_card: CreditCard,
  receipt: Receipt,
} as const

export const TenantSidebar = ({ activeSection, onSelectSection }: ITenantSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-slate-200 bg-slate-50/95 transition-all duration-200",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      <div className={cn("border-b border-slate-200 py-4", isCollapsed ? "px-3" : "px-5")}>
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between gap-3")}>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-700 text-sm font-semibold text-white shadow-sm shadow-blue-900/25">
            <Building2 className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-base font-bold text-blue-800">Quản trị tenant</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Cổng quản trị workspace</p>
            </div>
          )}
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-700"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className={cn("flex-1 space-y-6 overflow-y-auto py-5", isCollapsed ? "px-2" : "px-4")}>
        {TENANT_NAV_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
              {group.title && !isCollapsed && (
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{group.title}</p>
              )}
            {group.items.map((item) => {
              const isActive = item.section === activeSection
              const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? Settings
              const isClickable = Boolean(item.section)

              return (
                <button
                  key={item.label}
                  className={cn(
                    "flex w-full items-center rounded-lg py-2 text-left text-sm transition-all",
                    isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                    isActive
                      ? "bg-blue-100 text-blue-800"
                      : "text-slate-600 hover:bg-white hover:text-slate-900",
                    !isClickable && "cursor-not-allowed opacity-50"
                  )}
                  disabled={!isClickable}
                  onClick={() => item.section && onSelectSection(item.section)}
                  type="button"
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className={cn("space-y-2 border-t border-slate-200 py-5", isCollapsed ? "px-2" : "px-4")}>
        <button
          className={cn(
            "flex w-full items-center rounded-lg py-2 text-left text-sm text-slate-600 transition hover:bg-white hover:text-slate-900",
            isCollapsed ? "justify-center px-2" : "gap-3 px-3"
          )}
          type="button"
          title={isCollapsed ? "Hỗ trợ" : undefined}
        >
          <CircleAlert className="h-4 w-4" />
          {!isCollapsed && "Hỗ trợ"}
        </button>
        <button
          className={cn(
            "flex w-full items-center rounded-lg py-2 text-left text-sm text-slate-600 transition hover:bg-white hover:text-slate-900",
            isCollapsed ? "justify-center px-2" : "gap-3 px-3"
          )}
          type="button"
          title={isCollapsed ? "Tài liệu" : undefined}
        >
          <Blocks className="h-4 w-4" />
          {!isCollapsed && "Tài liệu"}
        </button>
      </div>
    </aside>
  )
}
