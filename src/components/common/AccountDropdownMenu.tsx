import { useEffect, useRef, useState } from "react"
import { ChevronRight, LogOut, Settings, User } from "lucide-react"

interface IAccountDropdownMenuProps {
  accountName: string
  accountRole: string
  accountEmail: string
  accentClassName?: string
  onLogout: () => void | Promise<void>
  onOpenAccount?: () => void
  onOpenSettings?: () => void
}

export const AccountDropdownMenu = ({
  accountName,
  accountRole,
  accountEmail,
  accentClassName = "bg-blue-100 text-blue-700",
  onLogout,
  onOpenAccount,
  onOpenSettings,
}: IAccountDropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuContainerRef.current) {
        return
      }

      if (!menuContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleOpenAccount = () => {
    onOpenAccount?.()
    setIsOpen(false)
  }

  const handleOpenSettings = () => {
    onOpenSettings?.()
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await onLogout()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuContainerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition-colors hover:bg-slate-50"
        onClick={() => setIsOpen((previousValue) => !previousValue)}
        type="button"
      >
        <div className={`grid h-8 w-8 place-items-center rounded-full ${accentClassName}`}>
          <User className="h-4 w-4" />
        </div>
        <div className="leading-tight text-left">
          <p className="text-xs font-semibold text-slate-900">{accountName}</p>
          <p className="text-[11px] text-slate-500">{accountRole}</p>
        </div>
        <ChevronRight
          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${isOpen ? "rotate-90" : "-rotate-90"}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
          role="menu"
        >
          <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tài khoản</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{accountName}</p>
            <p className="text-xs text-slate-500">{accountEmail}</p>
          </div>

          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            onClick={handleOpenAccount}
            role="menuitem"
            type="button"
          >
            <User className="h-4 w-4" />
            Quản lý tài khoản
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            onClick={handleOpenSettings}
            role="menuitem"
            type="button"
          >
            <Settings className="h-4 w-4" />
            Cài đặt
          </button>

          <div className="my-2 border-t border-slate-200" />

          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            onClick={handleLogout}
            role="menuitem"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
