import { Blocks, ChevronLeft, ChevronRight, CircleAlert } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { SYSTEM_NAV_GROUPS } from "@/pages/system-admin/constants"
import type { TSystemSection } from "@/pages/system-admin/types"

interface ISidebarNavigationProps {
  activeSection: TSystemSection
  onSelectSection: (section: TSystemSection) => void
}

export const SidebarNavigation = ({
  activeSection,
  onSelectSection,
}: ISidebarNavigationProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-slate-200 bg-slate-50/95 transition-all duration-200",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      <div className={cn("border-b border-slate-200 py-4", isCollapsed ? "px-3" : "px-5")}>
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between gap-3")}>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-700 text-sm font-semibold text-white shadow-sm shadow-blue-900/25">
            A
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-base font-bold text-blue-800">Quản trị hệ thống</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Điều hành doanh nghiệp</p>
            </div>
          )}
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-700"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={cn("flex-1 space-y-6 overflow-y-auto py-5", isCollapsed ? "px-2" : "px-4")}>
        {SYSTEM_NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{group.title}</p>
            )}
            {group.items.map((item) => {
              const isActive = item.section === activeSection
              const isClickable = Boolean(item.section)
              const Icon = item.icon

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
