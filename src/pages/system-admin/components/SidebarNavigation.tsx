import { Blocks, CircleAlert } from "lucide-react"
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
  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50/95">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-700 text-sm font-semibold text-white shadow-sm shadow-blue-900/25">
            A
          </div>
          <div>
            <p className="text-base font-bold text-blue-800">Quản trị hệ thống</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Điều hành doanh nghiệp</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {SYSTEM_NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{group.title}</p>
            {group.items.map((item) => {
              const isActive = item.section === activeSection
              const isClickable = Boolean(item.section)
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all",
                    isActive
                      ? "bg-blue-100 text-blue-800"
                      : "text-slate-600 hover:bg-white hover:text-slate-900",
                    !isClickable && "cursor-not-allowed opacity-50"
                  )}
                  disabled={!isClickable}
                  onClick={() => item.section && onSelectSection(item.section)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-slate-200 px-4 py-5">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-white hover:text-slate-900" type="button">
          <CircleAlert className="h-4 w-4" />
          Hỗ trợ
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-white hover:text-slate-900" type="button">
          <Blocks className="h-4 w-4" />
          Tài liệu
        </button>
      </div>
    </aside>
  )
}
