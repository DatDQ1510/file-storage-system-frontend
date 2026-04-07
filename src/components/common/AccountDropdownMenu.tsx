import { useEffect, useId, useRef, useState } from "react"
import { ChevronRight, LogOut, Settings, User } from "lucide-react"

export interface IAccountDropdownMenuProps {
  accountName: string
  accountRole: string
  accountEmail: string
  accentClassName?: string
  onLogout: () => void | Promise<void>
  onOpenAccount?: () => void
  onOpenSettings?: () => void
  showAccountAction?: boolean
  showSettingsAction?: boolean
}

export const AccountDropdownMenu = ({
  accountName,
  accountRole,
  accountEmail,
  accentClassName = "bg-blue-100 text-blue-700",
  onLogout,
  onOpenAccount,
  onOpenSettings,
  showAccountAction = true,
  showSettingsAction = true,
}: IAccountDropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuContainerRef = useRef<HTMLDivElement | null>(null)
  const menuId = useId()

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

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const handleOpenAccount = () => {
    onOpenAccount?.()
    setIsOpen(false)
  }

  const handleOpenSettings = () => {
    onOpenSettings?.()
    setIsOpen(false)
  }

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await onLogout()
      setIsOpen(false)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="relative" ref={menuContainerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 transition-colors hover:bg-muted"
        onClick={() => setIsOpen((previousValue) => !previousValue)}
        type="button"
      >
        <div className={`grid h-8 w-8 place-items-center rounded-full ${accentClassName}`}>
          <User className="h-4 w-4" />
        </div>
        <div className="leading-tight text-left">
          <p className="text-xs font-semibold text-foreground">{accountName}</p>
          <p className="text-[11px] text-muted-foreground">{accountRole}</p>
        </div>
        <ChevronRight
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : "-rotate-90"}`}
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-xl border border-border bg-card p-2 shadow-xl"
          role="menu"
        >
          <div className="mb-2 rounded-lg bg-muted px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tài khoản</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{accountName}</p>
            <p className="text-xs text-muted-foreground">{accountEmail}</p>
          </div>

          {showAccountAction && (
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
              onClick={handleOpenAccount}
              role="menuitem"
              type="button"
            >
              <User className="h-4 w-4" />
              Quản lý tài khoản
            </button>
          )}

          {showSettingsAction && (
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
              onClick={handleOpenSettings}
              role="menuitem"
              type="button"
            >
              <Settings className="h-4 w-4" />
              Cài đặt
            </button>
          )}

          {(showAccountAction || showSettingsAction) && <div className="my-2 border-t border-border" />}

          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            onClick={handleLogout}
            role="menuitem"
            type="button"
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      )}
    </div>
  )
}
