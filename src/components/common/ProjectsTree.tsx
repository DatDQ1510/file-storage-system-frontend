import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { PROJECT_ITEMS } from "@/constants/projects";
import { getProjectPath } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import {
  getUserProjectsPage,
  type IUserSidebarProjectItem,
} from "@/lib/api/user-project-service";
import { cn } from "@/lib/utils";

interface IProjectsTreeProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ProjectsTree = ({ isExpanded, onToggleExpand }: IProjectsTreeProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProjects, setUserProjects] = useState<IUserSidebarProjectItem[]>([]);
  const [currentPage, setCurrentPage] = useState(-1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingInitialPage, setIsLoadingInitialPage] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [hasLoadedInitialPage, setHasLoadedInitialPage] = useState(false);
  const isProjectSectionActive = location.pathname.startsWith("/projects");

  const handleProjectNavigation = (projectId: string) => {
    navigate(getProjectPath(projectId));
  };

  const shouldDisplay = isExpanded || isProjectSectionActive;

  const mockProjectIds = useMemo(() => {
    return new Set(PROJECT_ITEMS.map((projectItem) => projectItem.id));
  }, []);

  const visibleUserProjects = useMemo(() => {
    return userProjects.filter((projectItem) => {
      return !mockProjectIds.has(projectItem.id);
    });
  }, [mockProjectIds, userProjects]);

  const loadProjectPage = async (page: number, isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingNextPage(true);
    } else {
      setIsLoadingInitialPage(true);
    }

    try {
      const projectPage = await getUserProjectsPage({
        page,
        size: 10,
      });

      if (!isLoadMore) {
        setHasLoadedInitialPage(true);
      }

      setCurrentPage(projectPage.page);
      setHasNextPage(projectPage.hasNext);
      setUserProjects((currentProjects) => {
        const mergedProjects = isLoadMore
          ? [...currentProjects, ...projectPage.items]
          : projectPage.items;

        const projectMap = new Map<string, IUserSidebarProjectItem>();

        mergedProjects.forEach((projectItem) => {
          projectMap.set(projectItem.id, projectItem);
        });

        return Array.from(projectMap.values());
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load projects right now. Please try again.";

      toast.error(errorMessage);
    } finally {
      if (isLoadMore) {
        setIsLoadingNextPage(false);
      } else {
        setIsLoadingInitialPage(false);
      }
    }
  };

  const handleLoadMoreProjects = () => {
    if (!hasNextPage || isLoadingNextPage) {
      return;
    }

    void loadProjectPage(currentPage + 1, true);
  };

  useEffect(() => {
    if (!shouldDisplay || hasLoadedInitialPage || isLoadingInitialPage) {
      return;
    }

    void loadProjectPage(0);
  }, [hasLoadedInitialPage, isLoadingInitialPage, shouldDisplay]);

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

          {visibleUserProjects.map((projectItem) => {
            const projectPath = getProjectPath(projectItem.id);
            const activeProject =
              location.pathname === projectPath ||
              location.pathname.startsWith(`${projectPath}/`);

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

          {isLoadingInitialPage && (
            <p className="px-2 py-1 text-xs text-muted-foreground">Loading projects...</p>
          )}

          {hasNextPage && (
            <button
              className={cn(
                "flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-xs font-medium",
                "text-muted-foreground hover:bg-primary/20 hover:text-primary dark:hover:bg-primary/30 dark:hover:text-primary-foreground"
              )}
              disabled={isLoadingNextPage}
              onClick={handleLoadMoreProjects}
              type="button"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              <span>{isLoadingNextPage ? "Loading more..." : "Load more projects"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
