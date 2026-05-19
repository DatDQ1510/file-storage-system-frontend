import { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  FileBadge,
  FileText,
  Folder,
  Image,
  Loader2,
  Sheet,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { StarToggleButton } from "@/components/common/StarToggleButton";
import { getProjectFilePath } from "@/constants/routes";
import { getFolderByIdApi } from "@/pages/user/projects/api/folder-api";
import { getAllFilesApi, type IFileResponse } from "@/lib/api/file-service";
import { getStoredAuthData } from "@/lib/api/auth-service";
import { useStarredResources } from "@/hooks/use-starred-resources";
import type { IRecentFileItem } from "@/types/recent";

type TRecentFileType = IRecentFileItem["type"];

interface IRecentDisplayFile extends IRecentFileItem {
  groupLabel: string;
  projectId: string | null;
}

interface IRecentGroupWithLinks {
  id: string;
  label: string;
  files: IRecentDisplayFile[];
}

interface IRecentPageDataWithLinks {
  groups: IRecentGroupWithLinks[];
}

interface IFolderLookupResult {
  projectId: string;
  path: string;
  nameFolder: string;
}

const FILE_ICON_MAP = {
  pdf: <FileText className="h-5 w-5 text-blue-600" />,
  image: <Image className="h-5 w-5 text-purple-600" />,
  csv: <Sheet className="h-5 w-5 text-orange-600" />,
  video: <Clapperboard className="h-5 w-5 text-blue-600" />,
  folder: <Folder className="h-5 w-5 text-emerald-600" />,
} as const;

const FILE_TYPE_BY_EXTENSION: Record<string, TRecentFileType> = {
  pdf: "pdf",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  csv: "csv",
  mp4: "video",
  mov: "video",
  mkv: "video",
  doc: "pdf",
  docx: "pdf",
  xls: "csv",
  xlsx: "csv",
};

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Last Week", "Earlier"] as const;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const resolveFileType = (fileName: string): TRecentFileType => {
  const lower = fileName.toLowerCase();
  const extension = lower.includes(".") ? lower.split(".").pop() ?? "" : "";

  return FILE_TYPE_BY_EXTENSION[extension] ?? "pdf";
};

const formatFileTime = (dateValue: string) => {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
};

const getRelativeGroupLabel = (dateValue: string) => {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Earlier";
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  const dayDiff = Math.floor((startOfToday.getTime() - startOfTarget.getTime()) / 86400000);

  if (dayDiff <= 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff <= 6) return "This Week";
  if (dayDiff <= 13) return "Last Week";
  return "Earlier";
};

const groupRecentFiles = (files: IRecentDisplayFile[]): IRecentPageDataWithLinks => {
  const groupedFiles = new Map<string, IRecentDisplayFile[]>();

  for (const file of files) {
    const existing = groupedFiles.get(file.groupLabel) ?? [];
    existing.push(file);
    groupedFiles.set(file.groupLabel, existing);
  }

  return {
    groups: Array.from(groupedFiles.entries())
      .map(([label, grouped]) => ({
        id: label,
        label,
        files: grouped,
      }))
      .sort((first, second) => {
        const firstIndex = GROUP_ORDER.indexOf(first.label as (typeof GROUP_ORDER)[number]);
        const secondIndex = GROUP_ORDER.indexOf(second.label as (typeof GROUP_ORDER)[number]);

        if (firstIndex === -1 && secondIndex === -1) {
          return first.label.localeCompare(second.label);
        }

        if (firstIndex === -1) return 1;
        if (secondIndex === -1) return -1;

        return firstIndex - secondIndex;
      }),
  };
};

const toRecentFileItem = (
  file: IFileResponse,
  folder: IFolderLookupResult | null,
  groupLabel: string
): IRecentDisplayFile => {
  const location = folder?.path?.trim()
    ? folder.path.replace(/^\/+/, "").split("/").filter(Boolean).join(" / ")
    : folder?.nameFolder?.trim() || file.folderId || "Unknown location";

  return {
    id: file.id,
    name: file.nameFile,
    location,
    timeLabel: formatFileTime(file.updatedAt || file.createdAt),
    size: formatFileSize((file.sizeFile ?? 0) * 1024 * 1024),
    type: resolveFileType(file.nameFile),
    groupLabel,
    projectId: folder?.projectId ?? null,
  };
};

export const Recent = () => {
  const [data, setData] = useState<IRecentPageDataWithLinks>({ groups: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const authData = getStoredAuthData();
  const { isFileStarred, isLoadingStars, toggleFileStar } = useStarredResources();

  useEffect(() => {
    let isMounted = true;

    const loadRecentFiles = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const allFiles = await getAllFilesApi();
        const tenantId = typeof authData?.tenantId === "string" ? authData.tenantId.trim() : "";
        const visibleFiles = allFiles
          .filter((file) => !tenantId || file.tenantId === tenantId)
          .sort((left, right) => {
            const leftDate = new Date(left.updatedAt || left.createdAt).getTime();
            const rightDate = new Date(right.updatedAt || right.createdAt).getTime();

            return rightDate - leftDate;
          })
          .slice(0, 30);

        const folderIds = Array.from(new Set(visibleFiles.map((file) => file.folderId).filter(Boolean)));
        const folderMap = new Map<string, IFolderLookupResult | null>();

        await Promise.all(
          folderIds.map(async (folderId) => {
            try {
              const folder = await getFolderByIdApi(folderId);
              folderMap.set(folderId, folder);
            } catch {
              folderMap.set(folderId, null);
            }
          })
        );

        const recentFiles = visibleFiles.map((file) => {
          const groupLabel = getRelativeGroupLabel(file.updatedAt || file.createdAt);
          return toRecentFileItem(file, folderMap.get(file.folderId) ?? null, groupLabel);
        });

        if (isMounted) {
          setData(groupRecentFiles(recentFiles));
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load recent files.");
          setData({ groups: [] });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadRecentFiles();

    return () => {
      isMounted = false;
    };
  }, [authData?.tenantId]);

  const hasData = useMemo(() => data.groups.some((group) => group.files.length > 0), [data.groups]);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Recent Files
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your most recently modified assets and documents.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading recent files...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : !hasData ? (
        <div className="rounded-xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          No recent files found.
        </div>
      ) : (
        data.groups.map((group) => (
          <section key={group.id} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {group.label}
            </h2>

            <div className="overflow-hidden rounded-md border border-border bg-card">
              {group.files.map((file) => (
                <div
                  key={file.id}
                  role="button"
                  tabIndex={0}
                  className="flex w-full items-center border-b border-border px-5 py-4 text-left transition-colors hover:bg-muted/40 last:border-b-0"
                  onClick={() => {
                    if (!file.projectId) {
                      return;
                    }

                    navigate(getProjectFilePath(file.projectId, file.id));
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") {
                      return;
                    }

                    event.preventDefault();

                    if (!file.projectId) {
                      return;
                    }

                    navigate(getProjectFilePath(file.projectId, file.id));
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50 dark:bg-slate-900">
                      {FILE_ICON_MAP[file.type]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {file.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-44 justify-end text-xs text-foreground/80">
                    {file.timeLabel}
                  </div>
                  <div className="flex w-24 justify-end text-xs text-slate-500 dark:text-slate-400">
                    {file.size}
                  </div>
                  <div className="ml-3 flex items-center">
                    <StarToggleButton
                      isStarred={isFileStarred(file.id)}
                      isLoading={isLoadingStars}
                      onClick={() => void toggleFileStar(file.id)}
                      title={isFileStarred(file.id) ? "Unstar file" : "Star file"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      <div className="fixed bottom-6 right-6 z-20">
        <Button size="icon" className="h-12 w-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
          <FileBadge className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
