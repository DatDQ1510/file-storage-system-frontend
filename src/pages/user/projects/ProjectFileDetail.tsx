import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Check,
  Clock3,
  Download,
  FileText,
  Pencil,
  ShieldCheck,
  Share2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECT_ITEMS } from "@/constants/projects";
import {
  getDefaultProjectFileId,
  getProjectFileDetail,
} from "@/constants/project-files";
import { getProjectFilePath, getProjectPath } from "@/constants/routes";

export const ProjectFileDetail = () => {
  const navigate = useNavigate();
  const { projectId, fileId } = useParams();

  const selectedProject = PROJECT_ITEMS.find((projectItem) => {
    return projectItem.id === projectId;
  });

  const selectedFile = useMemo(() => {
    return getProjectFileDetail(projectId, fileId);
  }, [projectId, fileId]);

  if (!projectId || !selectedProject) {
    return null;
  }

  if (!selectedFile) {
    const fallbackFileId = getDefaultProjectFileId(projectId);

    if (fallbackFileId) {
      navigate(getProjectFilePath(projectId, fallbackFileId), { replace: true });
    } else {
      navigate(getProjectPath(projectId), { replace: true });
    }

    return null;
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-lg border border-border bg-card px-6 py-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Projects</span>
          <span>&gt;</span>
          <span>{selectedFile.projectName}</span>
          <span>&gt;</span>
          <span className="font-medium text-foreground">{selectedFile.name}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex size-8 items-center justify-center rounded bg-red-100 text-red-600">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground">
                <span>{selectedFile.name}</span>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{selectedFile.fileTypeLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="icon">
              <Star className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative h-70 w-full overflow-hidden bg-blue-900 sm:h-90 lg:h-105">
          <div className="absolute inset-0 opacity-70 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.14),rgba(255,255,255,0.14)_1px,transparent_1px,transparent_72px),repeating-linear-gradient(0deg,rgba(255,255,255,0.12),rgba(255,255,255,0.12)_1px,transparent_1px,transparent_64px)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_42%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.12),transparent_48%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button className="bg-white text-blue-700 hover:bg-white/90">
              Enter Presentation View
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <article className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            File Information
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Owner</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                  SC
                </span>
                <p className="text-sm font-medium text-foreground">{selectedFile.owner}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Dimensions / Size
              </p>
              <p className="mt-2 text-sm text-foreground">
                {selectedFile.sizeLabel} · {selectedFile.dimensionsLabel}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Timeline</p>
              <p className="mt-2 text-sm text-foreground">{selectedFile.createdLabel}</p>
              <p className="text-sm text-foreground">{selectedFile.modifiedLabel}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Permissions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedFile.permissions.map((permissionItem) => (
                  <span
                    key={permissionItem}
                    className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                  >
                    {permissionItem}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-2 text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-sm font-semibold">{selectedFile.complianceTitle}</p>
          </div>
          <p className="mt-3 text-xs text-blue-700/80">{selectedFile.complianceDescription}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-blue-600" />
            <h2 className="text-base font-semibold text-foreground">Version History</h2>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {selectedFile.versions.map((versionItem, index) => (
              <div
                key={versionItem.id}
                className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    {versionItem.label}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{versionItem.title}</p>
                    <p className="text-xs text-muted-foreground">{versionItem.submittedAt}</p>
                  </div>
                </div>
                {index === 0 && (
                  <span className="rounded-full bg-blue-600 p-1 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <h2 className="text-base font-semibold text-foreground">Activity Log</h2>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {selectedFile.activityItems.map((activityItem) => (
              <div key={activityItem.id} className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{activityItem.actor}</span> {activityItem.message}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{activityItem.timeLabel}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};
