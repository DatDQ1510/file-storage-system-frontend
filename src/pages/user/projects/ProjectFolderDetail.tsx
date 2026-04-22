import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { getProjectFilePath } from "@/constants/routes";
import { ProjectFileTypeIcon, type TProjectFileType } from "@/components/projects/ProjectFileTypeIcon";
import { ProjectFolderCard } from "@/components/projects/ProjectFolderCard";
import { CreateProjectFolderModal } from "@/pages/user/projects/components/CreateProjectFolderModal";
import { useProjectFolders } from "@/pages/user/projects/hooks/use-project-folders";
import {
  getChildFolderPathsApi,
  getFolderByIdApi,
  renameFolderApi,
  deleteFolderByActorApi,
} from "@/pages/user/projects/api/folder-api";
import type { IProjectFolderItem, IFolderPathNode } from "@/pages/user/projects/types/folder";
import { getUserProjectDetail, type IUserProjectDetail } from "@/lib/api/user-project-service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IProjectFileListItem {
  id: string;
  name: string;
  owner: string;
  lastModified: string;
  size: string;
  type: TProjectFileType;
}

// ─── Sub-folder section ───────────────────────────────────────────────────────

const SubFolderSection = ({
  projectId,
  folderId,
  folderPath,
  projectDetail,
  onRefresh,
}: {
  projectId: string;
  folderId: string;
  folderPath: string;
  projectDetail: IUserProjectDetail | null;
  onRefresh: () => void;
}) => {
  const [subFolders, setSubFolders] = useState<IFolderPathNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadSubFolders = useCallback(async () => {
    if (!folderPath) return;
    setIsLoading(true);
    try {
      const children = await getChildFolderPathsApi(projectId, folderPath);
      setSubFolders(children);
    } catch {
      setSubFolders([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, folderPath]);

  useEffect(() => {
    void loadSubFolders();
  }, [loadSubFolders]);

  const handleRenameSubFolder = async (subFolderId: string, newName: string) => {
    try {
      await renameFolderApi(subFolderId, newName);
      toast.success("Sub-folder renamed successfully");
      void loadSubFolders();
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename folder");
    }
  };

  const handleDeleteSubFolder = async (subFolderId: string) => {
    try {
      await deleteFolderByActorApi(subFolderId);
      toast.success("Sub-folder deleted successfully");
      void loadSubFolders();
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete folder");
    }
  };

  const isTenantAdmin = projectDetail?.currentUserRole === "TENANT_ADMIN";
  const isOwner = projectDetail?.ownerId === projectDetail?.currentUserId;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading sub-folders…
      </div>
    );
  }

  if (subFolders.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground">
          Sub-folders
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {subFolders.map((node) => {
          const folderItem: IProjectFolderItem = {
            id: node.folderId,
            name: node.nameFolder,
            filesCount: 0,
            parentFolderId: folderId,
          };
          return (
            <ProjectFolderCard
              key={node.folderId}
              folderId={node.folderId}
              name={node.nameFolder}
              filesCount={0}
              onClick={() => navigate(`/projects/${projectId}/folders/${node.folderId}`)}
              menuActions={{
                folderId: node.folderId,
                canWrite: isTenantAdmin || isOwner,
                canDelete: isTenantAdmin || isOwner,
                onRename: handleRenameSubFolder,
                onDelete: handleDeleteSubFolder,
              }}
            />
          );
        })}
      </div>
    </section>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const ProjectFolderDetail = () => {
  const navigate = useNavigate();
  const { projectId, folderId } = useParams();

  const [projectDetail, setProjectDetail] = useState<IUserProjectDetail | null>(null);
  const [isLoadingProjectDetail, setIsLoadingProjectDetail] = useState(false);
  const [folderPath, setFolderPath] = useState<string>("");
  const [folderName, setFolderName] = useState<string>("");
  const [isCreateSubFolderModalOpen, setIsCreateSubFolderModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<IProjectFileListItem[]>([]);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  const { createFolder, isCreatingFolder, loadFolders } = useProjectFolders(projectId);

  // ─── Load project detail ────────────────────────────────────────────────────

  useEffect(() => {
    if (!projectId) { setProjectDetail(null); return; }
    let mounted = true;
    setIsLoadingProjectDetail(true);
    getUserProjectDetail(projectId)
      .then((res) => { if (mounted) setProjectDetail(res); })
      .catch(() => { if (mounted) setProjectDetail(null); })
      .finally(() => { if (mounted) setIsLoadingProjectDetail(false); });
    return () => { mounted = false; };
  }, [projectId]);

  // ─── Load current folder info (path / name from API children of parent) ────

  useEffect(() => {
    if (!projectId || !folderId) return;
    const fetchFolderInfo = async () => {
      try {
        const folder = await getFolderByIdApi(folderId);
        setFolderPath(folder.path ?? "/");
        setFolderName(folder.nameFolder ?? folderId);
      } catch {
        setFolderPath("/");
        setFolderName(folderId);
      }
    };
    void fetchFolderInfo();
  }, [projectId, folderId]);

  // ─── File upload (local mock) ───────────────────────────────────────────────

  const resolveFileType = (fileName: string): TProjectFileType => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".pdf")) return "pdf";
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "docx";
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "xlsx";
    return "png";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUploadFiles = (files: FileList | null) => {
    if (!files) return;
    const items: IProjectFileListItem[] = Array.from(files).map((f) => ({
      id: `file-${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      owner: "Me",
      lastModified: "Just now",
      size: formatFileSize(f.size),
      type: resolveFileType(f.name),
    }));
    setUploadedFiles((prev) => [...items, ...prev]);
  };

  // ─── Create sub-folder ──────────────────────────────────────────────────────

  const handleCreateSubFolder = async (request: Parameters<typeof createFolder>[0]) => {
    try {
      await createFolder({
        ...request,
        path: folderPath || "/",
        parentFolderId: folderId,
      });
      toast.success("Sub-folder created successfully");
      setIsCreateSubFolderModalOpen(false);
      void loadFolders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create sub-folder");
    }
  };

  // ─── Guards ─────────────────────────────────────────────────────────────────

  if (!projectId || !folderId) return null;

  if (isLoadingProjectDetail) {
    return (
      <div className="rounded-md border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        Loading folder details…
      </div>
    );
  }

  const displayProjectName = projectDetail?.name ?? "Project";
  const displayFolderName = folderName || folderId;
  const isTenantAdmin = projectDetail?.currentUserRole === "TENANT_ADMIN";
  const isOwner = projectDetail?.ownerId === projectDetail?.currentUserId;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* Header */}
      <section className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <button
            type="button"
            className="hover:text-blue-600"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            {displayProjectName}
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{displayFolderName}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Folder className="h-5 w-5 text-amber-600" />
            </div>
            <h1 className="text-3xl font-semibold text-blue-700">{displayFolderName}</h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => fileUploadRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => setIsCreateSubFolderModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Folder
            </button>
          </div>
        </div>
      </section>

      {/* Hidden file input */}
      <input
        ref={fileUploadRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => { handleUploadFiles(e.target.files); e.currentTarget.value = ""; }}
      />

      {/* Sub-folders */}
      {folderPath && (
        <SubFolderSection
          projectId={projectId}
          folderId={folderId}
          folderPath={folderPath}
          projectDetail={projectDetail}
          onRefresh={() => void loadFolders()}
        />
      )}

      {/* Files */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground">Files</h2>
          <div className="flex items-center gap-3 text-muted-foreground">
            <button type="button" className="transition-colors hover:text-blue-700" aria-label="List view">
              <List className="h-4 w-4" />
            </button>
            <button type="button" className="text-blue-700" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full min-w-170 text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Last Modified</th>
                <th className="px-4 py-3">Size</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                    No files in this folder yet. Upload a file to get started.
                  </td>
                </tr>
              ) : (
                uploadedFiles.map((fileItem) => {
                  const isPreviewFile = fileItem.type === "pdf";
                  return (
                    <tr key={fileItem.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          className="flex items-center gap-3 text-left"
                          onClick={() => {
                            if (!isPreviewFile || !projectId) return;
                            navigate(getProjectFilePath(projectId, fileItem.id));
                          }}
                        >
                          <ProjectFileTypeIcon fileType={fileItem.type} />
                          <span className="font-medium text-foreground">{fileItem.name}</span>
                        </button>
                      </td>
                      <td className="px-4 py-4 text-foreground/90">{fileItem.owner}</td>
                      <td className="px-4 py-4 text-foreground/90">{fileItem.lastModified}</td>
                      <td className="px-4 py-4 text-foreground/90">{fileItem.size}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create sub-folder modal */}
      <CreateProjectFolderModal
        projectId={projectId}
        isOpen={isCreateSubFolderModalOpen}
        isSubmitting={isCreatingFolder}
        onClose={() => setIsCreateSubFolderModalOpen(false)}
        onSubmit={handleCreateSubFolder}
      />
    </div>
  );
};
