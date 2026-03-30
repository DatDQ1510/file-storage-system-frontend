import {
  Plus,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  FolderTree,
  ChartLine,
  Archive,
  ShieldCheck,
  Megaphone,
  CirclePlus,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IProjectsPageData, TProjectStatus } from "@/types/projects";

const MOCK_PROJECTS_DATA: IProjectsPageData = {
  projects: [
    {
      id: "1",
      name: "Titan Infrastructure",
      category: "Internal Development",
      projectLead: { id: "m1", name: "Sarah Chen", initials: "SC" },
      collaborator: { id: "m2", name: "James Lee", initials: "JL" },
      modifiedLabel: "2 h ago",
      filesCount: 428,
      status: "active",
      iconType: "infrastructure",
      isOnline: true,
    },
    {
      id: "2",
      name: "Market Sentinel",
      category: "Analytics and Research",
      projectLead: { id: "m3", name: "James Wilson", initials: "JW" },
      collaborator: { id: "m4", name: "Ella Frost", initials: "EF" },
      modifiedLabel: "Yesterday",
      filesCount: 1192,
      status: "active",
      iconType: "analytics",
      isOnline: true,
    },
    {
      id: "3",
      name: "Project Orion (2023)",
      category: "Legacy Migration",
      projectLead: { id: "m5", name: "System Archive", initials: "SA" },
      collaborator: { id: "m6", name: "System", initials: "SY" },
      modifiedLabel: "3 mo ago",
      filesCount: 2440,
      status: "archived",
      iconType: "legacy",
      isOnline: false,
    },
    {
      id: "4",
      name: "Cyber Audit Q4",
      category: "Security Compliance",
      projectLead: { id: "m7", name: "Alex Morgen", initials: "AM" },
      collaborator: { id: "m8", name: "Lex Morgan", initials: "LM" },
      modifiedLabel: "5 min ago",
      filesCount: 88,
      status: "active",
      iconType: "security",
      isOnline: true,
    },
    {
      id: "5",
      name: "Brand Genesis",
      category: "Marketing Assets",
      projectLead: { id: "m9", name: "Leo Valdez", initials: "LV" },
      collaborator: { id: "m10", name: "Ari Kim", initials: "AK" },
      modifiedLabel: "3 days ago",
      filesCount: 5200,
      status: "active",
      iconType: "marketing",
      isOnline: true,
    },
  ],
  activities: [
    {
      id: "a1",
      message: "Security Audit permissions updated for Titan Infrastructure",
      metadata: "8 minutes ago · system automation",
    },
    {
      id: "a2",
      message: "Sarah Chen uploaded 42 technical schematics to Titan Infrastructure",
      metadata: "2 hours ago · mobile upload",
    },
  ],
};

const PROJECT_ICON_MAP = {
  infrastructure: <FolderTree className="h-5 w-5 text-blue-600" />,
  analytics: <ChartLine className="h-5 w-5 text-amber-600" />,
  legacy: <Archive className="h-5 w-5 text-slate-500" />,
  security: <ShieldCheck className="h-5 w-5 text-violet-600" />,
  marketing: <Megaphone className="h-5 w-5 text-rose-600" />,
} as const;

const STATUS_BADGE_CLASS_MAP: Record<TProjectStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-200 text-slate-600",
};

export const Projects = () => {
  const data = MOCK_PROJECTS_DATA;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Enterprise · Projects
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
            Vault Directory
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage your organizational silos, project-specific security protocols, and
            collaborative data environments.
          </p>
        </div>

        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
        <div className="flex items-center gap-1">
          <Button size="sm" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Filter className="mr-2 h-3.5 w-3.5" />
            All Projects
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-600">
            Active
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-600">
            Archived
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Sort by:
            <span className="ml-1 text-slate-600">Last Modified</span>
          </p>
          <div className="flex items-center gap-1 rounded border border-border bg-background p-1">
            <Button variant="ghost" size="icon-xs" className="h-6 w-6">
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs" className="h-6 w-6">
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.projects.map((project) => (
          <article
            key={project.id}
            className="rounded-md border border-border bg-card px-4 py-4 transition-colors hover:border-blue-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50">
                {PROJECT_ICON_MAP[project.iconType]}
              </div>
              <div className="flex items-center gap-2">
                {project.isOnline && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            <h3 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
              {project.name}
            </h3>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {project.category}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate">Project Lead: {project.projectLead.name}</p>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-semibold text-amber-700">
                  {project.projectLead.initials}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p>Modified</p>
                <p className="text-[11px] font-semibold uppercase text-foreground/80">
                  {project.modifiedLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                {project.filesCount.toLocaleString()} files
              </p>
              <span
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  STATUS_BADGE_CLASS_MAP[project.status]
                )}
              >
                {project.status}
              </span>
            </div>
          </article>
        ))}

        <article className="flex min-h-80 items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
          <div>
            <CirclePlus className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Initiate Project
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Define workspace, permissions, and initial repository structure.
            </p>
          </div>
        </article>
      </section>

      <section className="rounded-md border border-border bg-card px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Recent Project Activity
        </h2>

        <div className="mt-4 space-y-2">
          {data.activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded border border-border bg-background px-3 py-3"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-50">
                <FileText className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-foreground">{activity.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {activity.metadata}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
