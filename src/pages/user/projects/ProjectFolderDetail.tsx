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
import { StarToggleButton } from "@/components/common/StarToggleButton";
import { ProjectFileTypeIcon, type TProjectFileType } from "@/components/projects/ProjectFileTypeIcon";
import { ProjectFolderCard } from "@/components/projects/ProjectFolderCard";
import { CreateProjectFolderModal } from "@/pages/user/projects/components/CreateProjectFolderModal";
import { useProjectFolders } from "@/pages/user/projects/hooks/use-project-folders";
import { useChunkedUpload } from "@/hooks/use-chunked-upload";
import { useStarredResources } from "@/hooks/use-starred-resources";
import {
  getFolderByIdApi,
  renameFolderApi,
  deleteFolderByActorApi,
  getChildFoldersByParentIdApi,
} from "@/pages/user/projects/api/folder-api";
import { getFilesByFolderApi } from "@/lib/api/file-service-updated";
import { renameFileApi, deleteFileApi } from "@/lib/api/file-operations-service";
import type { IFolderResponse } from "@/pages/user/projects/types/folder";
import { getStoredAuthData } from "@/lib/api/auth-service";
import { getUserProjectDetail, type IUserProjectDetail } from "@/lib/api/user-project-service";
import { ProjectFileRow } from "@/components/projects/ProjectFileRow";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IProjectFileListItem {
  id: string;
  name: string;
  owner: string;
  lastModified: string;
  size: string;
  type: TProjectFileType;
  extraInfo?: unknown;
}

// ─── Sub-folder section ───────────────────────────────────────────────────────

const SubFolderSection = ({
  projectId,
  folderId,
  projectDetail,
  refreshKey,
  onRefresh,
  isFolderStarred,
  isStarLoading,
  onToggleFolderStar,
}: {
  projectId: string;
  folderId: string;
  projectDetail: IUserProjectDetail | null;
  /** Tăng giá trị này để trigger reload danh sách subfolder */
  refreshKey: number;
  onRefresh: () => void;
  isFolderStarred: (folderId: string) => boolean;
  isStarLoading: boolean;
  onToggleFolderStar: (folderId: string) => void;
}) => {
  const [subFolders, setSubFolders] = useState<IFolderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadSubFolders = useCallback(async () => {
    setIsLoading(true);
    try {
      const children = await getChildFoldersByParentIdApi(folderId, projectId);
      setSubFolders(children);
    } catch {
      setSubFolders([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, folderId]);

  // Re-fetch mỗi khi refreshKey thay đổi (do parent tạo subfolder mới)
  useEffect(() => {
    void loadSubFolders();
  }, [loadSubFolders, refreshKey]);

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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
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
        {subFolders.map((folder) => {
          return (
            <ProjectFolderCard
              key={folder.id}
              folderId={folder.id}
              name={folder.nameFolder}
              filesCount={0}
              isStarred={isFolderStarred(folder.id)}
              isStarLoading={isStarLoading}
              onClick={() => navigate(`/projects/${projectId}/folders/${folder.id}`)}
              onToggleStar={() => onToggleFolderStar(folder.id)}
              menuActions={{
                folderId: folder.id,
                canWrite: Boolean(projectDetail?.currentUserIsOwner || projectDetail?.currentUserCanManageMembers),
                canDelete: Boolean(projectDetail?.currentUserIsOwner || projectDetail?.currentUserCanManageMembers),
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
  const [folderName, setFolderName] = useState<string>("");
  const [isFolderDeleted, setIsFolderDeleted] = useState(false);
  const [isCreateSubFolderModalOpen, setIsCreateSubFolderModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<IProjectFileListItem[]>([]);
  /** Tăng giá trị để trigger SubFolderSection tự reload */
  const [subFolderRefreshKey, setSubFolderRefreshKey] = useState(0);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);
  const authData = getStoredAuthData();
  const tenantId = authData?.tenantId?.trim() ?? "";
  const ownerId = authData?.userId?.trim() ?? "";

  const { createFolder, isCreatingFolder, loadFolders } = useProjectFolders(projectId);
  const { uploadFile, isUploading, overallProgress, statusText } = useChunkedUpload();
  const {
    isFileStarred,
    isFolderStarred,
    isLoadingStars,
    toggleFileStar,
    toggleFolderStar,
  } = useStarredResources();

  // ─── Load project detail ────────────────────────────────────────────────────

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let mounted = true;
    const loadProjectDetail = async () => {
      setIsLoadingProjectDetail(true);

      try {
        const res = await getUserProjectDetail(projectId);
        if (mounted) setProjectDetail(res);
      } catch {
        if (mounted) setProjectDetail(null);
      } finally {
        if (mounted) setIsLoadingProjectDetail(false);
      }
    };

    void loadProjectDetail();
    return () => { mounted = false; };
  }, [projectId]);

  // ─── Load current folder info (name) ────────────────────────────────────────

  useEffect(() => {
    if (!projectId || !folderId) return;
    const fetchFolderInfo = async () => {
      try {
        const folder = await getFolderByIdApi(folderId);
        if (folder.deletedAt) {
          setIsFolderDeleted(true);
          setFolderName(folderId);
          return;
        }

        setIsFolderDeleted(false);
        setFolderName(folder.nameFolder ?? folderId);
      } catch {
        setIsFolderDeleted(true);
        setFolderName(folderId);
      }
    };
    void fetchFolderInfo();
  }, [projectId, folderId]);

  // ─── File upload & listing ───────────────────────────────────────────────────

  const loadFiles = useCallback(async () => {
    if (!folderId) return;
    try {
      const files = await getFilesByFolderApi(folderId);
      const mappedFiles: IProjectFileListItem[] = files.map((file) => ({
        id: file.id,
        name: file.nameFile,
        owner: file.ownerId === ownerId ? "Me" : file.ownerId, // Just a fallback, would normally look up user name
        lastModified: new Date(file.updatedAt).toLocaleString(),
        size: formatFileSize(file.sizeFile * 1024 * 1024), // The backend returns size in MB
        type: resolveFileType(file.nameFile),
        extraInfo: file.extraInfo
      }));
      setUploadedFiles(mappedFiles);
    } catch {
      toast.error("Failed to load files in folder");
    }
  }, [folderId, ownerId]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

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

  const handleUploadFiles = useCallback(async (files: FileList | null) => {
    if (!projectId || !files || files.length === 0) {
      return;
    }

    if (!tenantId) {
      toast.error("Missing tenant ID. Please sign in again.");
      return;
    }

    if (!folderId || !ownerId) {
      toast.error("Missing folder or owner information. Please reload the page and try again.");
      return;
    }

    const fileList = Array.from(files);

    try {
      for (const fileItem of fileList) {
        const finalizedUpload = await uploadFile(fileItem, {
          tenantId,
          folderId,
          ownerId,
        });

        if (!finalizedUpload) {
          continue;
        }
      }

      toast.success("File uploaded successfully");
      // Trigger a reload of files to show the newly uploaded file. It might be delayed slightly due to async assembly.
      setTimeout(() => void loadFiles(), 1500); 
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    }
  }, [folderId, ownerId, projectId, tenantId, uploadFile, loadFiles]);

  const handleRenameFile = async (fileId: string, newName: string) => {
    try {
      await renameFileApi(fileId, newName);
      toast.success("File renamed successfully");
      void loadFiles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename file");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFileApi(fileId);
      toast.success("File deleted successfully");
      void loadFiles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete file");
    }
  };

  // ─── Create sub-folder ──────────────────────────────────────────────────────

  // Modal đã tự gắn parentFolderId vào request (vì prop parentFolderId={folderId} được truyền vào modal)
  const handleCreateSubFolder = async (request: Parameters<typeof createFolder>[0]) => {
    try {
      await createFolder(request)
      toast.success("Sub-folder created successfully")
      setIsCreateSubFolderModalOpen(false)
      // Tăng refreshKey để SubFolderSection tự reload danh sách ngay lập tức
      setSubFolderRefreshKey((prev) => prev + 1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create sub-folder")
      throw error
    }
  }

  // ─── Guards ─────────────────────────────────────────────────────────────────

  if (!projectId || !folderId) return null;

  if (isLoadingProjectDetail) {
    return (
      <div className="rounded-md border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        Loading folder details…
      </div>
    );
  }

  if (isFolderDeleted) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        Folder not found or has been deleted.
      </div>
    );
  }

  const displayProjectName = projectDetail?.name ?? "Project";
  const displayFolderName = folderName || folderId;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="project-shell space-y-8">

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
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 px-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => fileUploadRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload File"}
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
        onChange={(e) => {
          void handleUploadFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      {isUploading ? (
        <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <span className="font-medium">{statusText || "Uploading file"}</span>
          <span className="ml-2 text-blue-600">{overallProgress}%</span>
        </div>
      ) : null}

      {/* Sub-folders – reload tự động khi subFolderRefreshKey thay đổi */}
      <SubFolderSection
        projectId={projectId}
        folderId={folderId}
        projectDetail={projectDetail}
        refreshKey={subFolderRefreshKey}
        onRefresh={() => void loadFolders()}
        isFolderStarred={isFolderStarred}
        isStarLoading={isLoadingStars}
        onToggleFolderStar={(subFolderId) => {
          void toggleFolderStar(subFolderId);
        }}
      />

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
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    No files in this folder yet. Upload a file to get started.
                  </td>
                </tr>
              ) : (
                uploadedFiles.map((fileItem) => {
                  return (
                    <ProjectFileRow
                      key={fileItem.id}
                      fileId={fileItem.id}
                      name={fileItem.name}
                      owner={fileItem.owner}
                      lastModified={fileItem.lastModified}
                      size={fileItem.size}
                      fileType={fileItem.type}
                      isStarred={isFileStarred(fileItem.id)}
                      isStarLoading={isLoadingStars}
                      onToggleStar={() => void toggleFileStar(fileItem.id)}
                      onClick={() => {
                        if (!projectId) return;
                        navigate(getProjectFilePath(projectId, fileItem.id));
                      }}
                      menuActions={{
                        fileId: fileItem.id,
                        canWrite: Boolean(projectDetail?.currentUserIsOwner || projectDetail?.currentUserCanManageMembers),
                        canDelete: Boolean(projectDetail?.currentUserIsOwner || projectDetail?.currentUserCanManageMembers),
                        onRename: handleRenameFile,
                        onDelete: handleDeleteFile,
                      }}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create sub-folder modal – truyền parentFolderId để modal biết đang tạo subfolder */}
      <CreateProjectFolderModal
        projectId={projectId}
        parentFolderId={folderId}
        isOpen={isCreateSubFolderModalOpen}
        isSubmitting={isCreatingFolder}
        onClose={() => setIsCreateSubFolderModalOpen(false)}
        onSubmit={handleCreateSubFolder}
      />
    </div>
  );
};
