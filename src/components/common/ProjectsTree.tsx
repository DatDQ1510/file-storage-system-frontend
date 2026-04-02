import { useLocation, useNavigate } from "react-router";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { PROJECT_ITEMS } from "@/constants/projects";
import { getProjectPath } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IProjectsTreeProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ProjectsTree = ({ isExpanded, onToggleExpand }: IProjectsTreeProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProjectSectionActive = location.pathname.startsWith("/projects");

  const handleProjectNavigation = (projectId: string) => {
    navigate(getProjectPath(projectId));
  };

  const shouldDisplay = isExpanded || isProjectSectionActive;

  return (
    <div className="pt-1">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-between gap-3 text-sm",
          isProjectSectionActive
            ? "bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/20"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={onToggleExpand}
      >
        <span className="flex items-center gap-3">
          <FolderOpen className="h-5 w-5 shrink-0" />
          <span>Projects</span>
        </span>
        {shouldDisplay ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {shouldDisplay && (
        <div className="mt-1 space-y-1 pl-8">
          {PROJECT_ITEMS.map((projectItem) => {
            const projectPath = getProjectPath(projectItem.id);
            const activeProject = location.pathname === projectPath;

            return (
              <button
                key={projectItem.id}
                className={cn(
                  "flex w-full items-center truncate rounded-md px-2 py-1 text-left text-xs font-medium transition-all",
                  activeProject
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-100"
                    : "text-muted-foreground hover:bg-primary/20 hover:text-primary dark:hover:bg-primary/30 dark:hover:text-primary-foreground"
                )}
                onClick={() => handleProjectNavigation(projectItem.id)}
                type="button"
              >
                <span className="truncate">{projectItem.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
