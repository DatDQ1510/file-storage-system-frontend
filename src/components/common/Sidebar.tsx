import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Home,
  Star,
  Trash2,
  HelpCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProjectsTree } from "./ProjectsTree";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);

  const navItems = [
    { label: "Recent", icon: Home, path: ROUTES.RECENT },
    { label: "Starred", icon: Star, path: ROUTES.STARRED },
  ];

  const footerItems = [
    { label: "Recycle Bin", icon: Trash2, path: ROUTES.RECYCLE_BIN },
    { label: "Support", icon: HelpCircle, path: ROUTES.SUPPORT },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;
  const handleProjectSectionClick = () => {
    setIsProjectsExpanded((currentValue) => !currentValue);
  };

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-background transition-all duration-200",
        isSidebarCollapsed ? "w-20" : "w-56"
      )}
    >
      <div className={cn("flex items-center border-b border-border py-6", isSidebarCollapsed ? "justify-center px-2" : "gap-2 px-4")}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-sm font-bold text-white">V</span>
        </div>
        {!isSidebarCollapsed && (
          <div className="flex-1">
            <p className="text-xs font-semibold text-foreground">Vault</p>
            <p className="text-xs text-muted-foreground">ENTERPRISE STORAGE</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
          title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          aria-label={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className={cn("min-h-0 flex-1 space-y-1 overflow-y-auto py-4", isSidebarCollapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full text-sm",
                isSidebarCollapsed ? "justify-center px-2" : "justify-start gap-3",
                active
                  ? "bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleNavigation(item.path)}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Button>
          );
        })}

        {isSidebarCollapsed ? (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-center px-2 text-sm",
              location.pathname.startsWith("/projects")
                ? "bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/20"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleNavigation(ROUTES.PROJECTS)}
            title="Projects"
          >
            <FolderOpen className="h-5 w-5 shrink-0" />
          </Button>
        ) : (
          <ProjectsTree isExpanded={isProjectsExpanded} onToggleExpand={handleProjectSectionClick} />
        )}
      </nav>

      <div className={cn("shrink-0 border-t border-border py-4", isSidebarCollapsed ? "px-2" : "px-3")}>
        <div className="space-y-1">
          {footerItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full text-sm",
                  isSidebarCollapsed ? "justify-center px-2" : "justify-start gap-3",
                  active
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleNavigation(item.path)}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </div>

        <div className={cn("mt-4 flex items-center rounded-lg border border-border p-3", isSidebarCollapsed ? "justify-center" : "gap-2")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
            <span className="text-xs font-semibold text-orange-600">AW</span>
          </div>
          {!isSidebarCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">Alexander Wright</p>
                <p className="truncate text-xs text-muted-foreground">PRO ACCOUNT</p>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
