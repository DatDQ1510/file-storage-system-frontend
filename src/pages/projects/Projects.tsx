import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Folder, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROJECT_ITEMS } from "@/constants/projects";
import { getProjectPath } from "@/constants/routes";

export const Projects = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const selectedProject = PROJECT_ITEMS.find((projectItem) => {
    return projectItem.id === projectId;
  });

  useEffect(() => {
    if (!projectId && PROJECT_ITEMS.length > 0) {
      navigate(getProjectPath(PROJECT_ITEMS[0].id), { replace: true });
      return;
    }

    if (projectId && !selectedProject && PROJECT_ITEMS.length > 0) {
      navigate(getProjectPath(PROJECT_ITEMS[0].id), { replace: true });
    }
  }, [navigate, projectId, selectedProject]);

  if (!selectedProject) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Project Workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              {selectedProject.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {selectedProject.description}
            </p>
          </div>

          <div className="rounded-md border border-border bg-background px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Last Updated</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{selectedProject.updatedLabel}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
              {selectedProject.totalFiles.toLocaleString()} files
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Folders</h2>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>

        <div className="space-y-3">
          {selectedProject.folders.map((folderItem) => (
            <article
              key={folderItem.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-blue-300"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-md bg-muted p-2">
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{folderItem.name}</p>
                  <p className="text-xs text-muted-foreground">{folderItem.filesCount} files</p>
                </div>
              </div>

              <p className="shrink-0 text-xs font-medium text-muted-foreground">{folderItem.updatedLabel}</p>
            </article>
          ))}

          <article className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/15 px-4 py-6 text-center">
            <div>
              <Folder className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Create a new folder in {selectedProject.name}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Project Info</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{selectedProject.category}</p>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Project Lead</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{selectedProject.projectLead}</p>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <p
              className={cn(
                "mt-1 inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                selectedProject.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              )}
            >
              {selectedProject.status}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
