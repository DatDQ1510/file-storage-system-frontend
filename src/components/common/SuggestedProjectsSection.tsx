import type { ISuggestedProject } from "@/types/dashboard";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ISuggestedProjectsSectionProps {
  projects: ISuggestedProject[];
}

const STATUS_COLOR_MAP: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  "in-review": "bg-amber-100 text-amber-800",
  planning: "bg-gray-100 text-gray-800",
};

export const SuggestedProjectsSection = ({
  projects,
}: ISuggestedProjectsSectionProps) => {
  return (
    <section className="h-full rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          SUGGESTED PROJECTS
        </h2>
        <Button variant="ghost" size="sm" className="text-blue-600">
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col rounded-lg border border-border/80 bg-background p-5 transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold">
                {project.icon}
              </div>
              <span
                className={cn(
                  "rounded px-2.5 py-0.5 text-xs font-medium",
                  STATUS_COLOR_MAP[project.status]
                )}
              >
                {project.status.toUpperCase().replace("-", " ")}
              </span>
            </div>

            <h3 className="mb-1 font-semibold text-foreground">
              {project.name}
            </h3>
            <p className="mb-4 flex-1 text-sm text-muted-foreground">
              {project.description}
            </p>

            <div className="border-t border-border pt-3 text-xs text-muted-foreground">
              <p>
                Last activity: <span className="font-medium">{project.lastActivity}</span>
              </p>
              {project.members && (
                <p className="mt-1">
                  Team size: <span className="font-medium">{project.members}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
