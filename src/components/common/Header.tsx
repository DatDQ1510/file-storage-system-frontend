import { Search, Bell, Settings, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { NotificationsPanel } from "./NotificationsPanel";
import { SettingsPanel } from "./SettingsPanel";

interface IHeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: IHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, setTheme } = useTheme();
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
    setShowNotifications(!showNotifications);
    setShowSettings(false);
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    setShowNotifications(false);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="flex items-center justify-between gap-4 px-8 py-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="min-w-0 flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files, folders, and projects..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 pl-10 text-sm placeholder-muted-foreground transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/70 bg-card/70 p-1">
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
            <Button
              variant="ghost"
              size="icon"
              className={actionButtonClassName}
              title="Notifications"
              onClick={handleNotificationsClick}
            >
              <Bell className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={actionButtonClassName}
              title="Settings"
              onClick={handleSettingsClick}
            >
              <Settings className="h-4.5 w-4.5" />
            </Button>

            {/* User Profile Avatar */}
            <button
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-orange-500 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:brightness-115 dark:hover:shadow-orange-900/40"
              title="Profile"
              type="button"
            >
              AW
            </button>
          </div>
        </div>
      </header>

      <NotificationsPanel isOpen={showNotifications} onClose={handleCloseNotifications} />
      <SettingsPanel isOpen={showSettings} onClose={handleCloseSettings} />
    </>
  );
};

