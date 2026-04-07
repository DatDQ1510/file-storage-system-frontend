import type { ReactNode } from "react";
import { Search, Bell, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AccountDropdownMenu } from "@/components/common/AccountDropdownMenu";
import { useTheme } from "@/components/theme-provider";
import { ROUTES } from "@/constants/routes";
import { signOut } from "@/lib/api/auth-service";
import { NotificationsPanel } from "./NotificationsPanel";
import { SettingsPanel } from "./SettingsPanel";

interface IHeaderProps {
  onMenuClick?: () => void;
  leadingContent?: ReactNode;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showThemeToggle?: boolean;
  showNotificationButton?: boolean;
  rightActions?: ReactNode;
  containerClassName?: string;
  innerClassName?: string;
  accountName?: string;
  accountRole?: string;
  accountEmail?: string;
  accountAccentClassName?: string;
  onOpenAccount?: () => void;
  onOpenSettings?: () => void;
  showAccountAction?: boolean;
}

export const Header = ({
  onMenuClick,
  leadingContent,
  searchPlaceholder = "Search files, folders, and projects...",
  showSearch = true,
  showThemeToggle = true,
  showNotificationButton = true,
  rightActions,
  containerClassName = "sticky top-0 z-50 border-b border-border bg-background",
  innerClassName = "px-8 py-4",
  accountName = "Alexander Wright",
  accountRole = "Pro Account",
  accountEmail = "alexander.wright@vault.enterprise",
  accountAccentClassName = "bg-orange-100 text-orange-700",
  onOpenAccount,
  onOpenSettings,
  showAccountAction = false,
}: IHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const actionButtonClassName =
    "h-9 w-9 rounded-lg text-muted-foreground transition-all duration-200 hover:bg-primary/25 hover:text-primary hover:shadow-md dark:hover:bg-primary/45 dark:hover:text-primary-foreground dark:hover:ring-1 dark:hover:ring-primary/50";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Search:", searchQuery);
  };

  const isDarkTheme =
    theme === "dark" ||
    (theme === "system" && document.documentElement.classList.contains("dark"));

  const handleThemeToggle = () => {
    setTheme(isDarkTheme ? "light" : "dark");
  };

  const handleNotificationsClick = () => {
    setIsNotificationsPanelOpen(!isNotificationsPanelOpen);
  };

  const handleSettingsClick = () => {
    setIsSettingsPanelOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsPanelOpen(false);
  };

  const handleCloseSettings = () => {
    setIsSettingsPanelOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.SIGN_IN, { replace: true });
  };

  return (
    <>
      <header className={containerClassName}>
        <div className={`flex items-center gap-4 ${innerClassName}`}>
          {/* Mobile Menu Button */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {leadingContent && <div className="min-w-0 flex-1">{leadingContent}</div>}

          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="min-w-0 flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 pl-10 text-sm placeholder-muted-foreground transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </form>
          )}

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/70 bg-card/70 p-1">
            {showThemeToggle && (
              <Button
                variant="ghost"
                size="icon"
                className={actionButtonClassName}
                title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
                onClick={handleThemeToggle}
              >
                {isDarkTheme ? (
                  <Sun className="h-4.5 w-4.5" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )}
              </Button>
            )}
            {showNotificationButton && (
              <Button
                variant="ghost"
                size="icon"
                className={actionButtonClassName}
                title="Notifications"
                onClick={handleNotificationsClick}
              >
                <Bell className="h-4.5 w-4.5" />
              </Button>
            )}
            {rightActions}
            <AccountDropdownMenu
              accountEmail={accountEmail}
              accountName={accountName}
              accountRole={accountRole}
              accentClassName={accountAccentClassName}
              onOpenAccount={onOpenAccount}
              onOpenSettings={onOpenSettings ?? handleSettingsClick}
              showAccountAction={showAccountAction}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <NotificationsPanel isOpen={isNotificationsPanelOpen} onClose={handleCloseNotifications} />
      <SettingsPanel isOpen={isSettingsPanelOpen} onClose={handleCloseSettings} onSignOut={handleLogout} />
    </>
  );
};

