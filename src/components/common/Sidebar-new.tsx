import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Heart,
  Home,
  Star,
  Trash2,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProjectsTree } from "./ProjectsTree";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);

  const navItems = [
    { label: "For You", icon: Heart, path: ROUTES.HOME },
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
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-4 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-sm font-bold text-white">V</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">Vault</p>
          <p className="text-xs text-muted-foreground">ENTERPRISE STORAGE</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sm",
                active
                  ? "bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Button>
          );
        })}

        <ProjectsTree isExpanded={isProjectsExpanded} onToggleExpand={handleProjectSectionClick} />
      </nav>

      <div className="border-t border-border px-3 py-4">
        <div className="space-y-1">
          {footerItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sm",
                  active
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
            <span className="text-xs font-semibold text-orange-600">AW</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">Alexander Wright</p>
            <p className="truncate text-xs text-muted-foreground">PRO ACCOUNT</p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
};
