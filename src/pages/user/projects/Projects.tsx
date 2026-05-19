import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LayoutGrid, List, Plus, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getProjectFilePath, getProjectFolderPath } from "@/constants/routes";
import { AddProjectMemberModal } from "@/components/projects/AddProjectMemberModal";
import { ProjectMembersModal } from "@/components/projects/ProjectMembersModal";
import { ProjectFolderActions } from "@/components/projects/ProjectFolderActions";
import { ProjectFolderCard } from "@/components/projects/ProjectFolderCard";
import { ProjectFileCard } from "@/components/projects/ProjectFileCard";
import { ProjectFileRow } from "@/components/projects/ProjectFileRow";
import { type TProjectFileType } from "@/components/projects/ProjectFileTypeIcon";
import { CreateProjectFolderModal } from "@/pages/user/projects/components/CreateProjectFolderModal";
import { useProjectFolders } from "@/pages/user/projects/hooks/use-project-folders";
import type { ICreateFolderWithAclRequest, IProjectFolderItem } from "@/pages/user/projects/types/folder";
import { renameFolderApi, deleteFolderByActorApi } from "@/pages/user/projects/api/folder-api";
import { getStoredAuthData } from "@/lib/api/auth-service";
import { createFileApi, getAllFilesApi, type IFileResponse, type TFileStatus } from "@/lib/api/file-service";
import { renameFileApi, deleteFileApi } from "@/lib/api/file-operations-service";
import { useStarredResources } from "@/hooks/use-starred-resources";
import {
  assignProjectMember,
  getProjectMembers,
  getTenantUserOptions,
  getUserProjectDetail,
  removeProjectMember,
  updateProjectMemberPermission,
  type IProjectMemberItem,
  type IUserProjectDetail,
  type IUserTenantOption,
} from "@/lib/api/user-project-service";

interface IProjectFileListItem {
  id: string;
  name: string;
  owner: string;
  lastModified: string;
  size: string;
  type: TProjectFileType;
}

const toFileItem = (file: IFileResponse): IProjectFileListItem => {
  return {
    id: file.id,
    name: file.nameFile,
    owner: file.ownerId,
    lastModified: file.updatedAt || file.createdAt,
    size: `${Math.max(1, Math.round((file.sizeFile ?? 0) * 1024))} KB`,
    type: file.nameFile.toLowerCase().endsWith(".pdf")
      ? "pdf"
      : file.nameFile.toLowerCase().endsWith(".doc") || file.nameFile.toLowerCase().endsWith(".docx")
        ? "docx"
        : file.nameFile.toLowerCase().endsWith(".xls") || file.nameFile.toLowerCase().endsWith(".xlsx")
          ? "xlsx"
          : "png",
  }
}

export const Projects = () => {
  const navigate = useNavigate();
  const [projectId] = useState(useParams().projectId);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeFolderId, setActiveFolderId] = useState<string>("");
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [uploadedFilesByProject, setUploadedFilesByProject] = useState<Record<string, IProjectFileListItem[]>>({});
  const [projectDetail, setProjectDetail] = useState<IUserProjectDetail | null>(null);
  const [hasLoadedProjectDetail, setHasLoadedProjectDetail] = useState(false);
  const [isLoadingProjectDetail, setIsLoadingProjectDetail] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isSubmittingAddUser, setIsSubmittingAddUser] = useState(false);
  const [isProjectMembersModalOpen, setIsProjectMembersModalOpen] = useState(false);
  const [isSubmittingMemberAction, setIsSubmittingMemberAction] = useState(false);
  const [projectMembers, setProjectMembers] = useState<IProjectMemberItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const {
    folders: folderItems,
    isCreatingFolder,
    loadFolders,
    createFolder,
  } = useProjectFolders(projectId);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);
  const folderUploadRef = useRef<HTMLInputElement | null>(null);
  const authData = getStoredAuthData();
  const {
    isFileStarred,
    isFolderStarred,
    isLoadingStars,
    toggleFileStar,
    toggleFolderStar,
  } = useStarredResources();

  const displayProjectName = projectDetail?.name || "Project Workspace";


  const selectedFolderId = useMemo(() => {
    const hasActiveFolder = folderItems.some((folderItem) => {
      return folderItem.id === activeFolderId;
    });

    if (hasActiveFolder) {
      return activeFolderId;
    }

    return folderItems[0]?.id ?? "";
  }, [activeFolderId, folderItems]);

  const fileItems = useMemo<IProjectFileListItem[]>(() => {
    if (!projectId) {
      return [];
    }

    return uploadedFilesByProject[projectId] ?? [];
  }, [projectId, uploadedFilesByProject]);


  useEffect(() => {
    if (!projectId) {
      setProjectDetail(null);
      setHasLoadedProjectDetail(false);
      return;
    }

    let isMounted = true;

    const loadProjectDetail = async () => {
      setIsLoadingProjectDetail(true);

      try {
        const response = await getUserProjectDetail(projectId);

        if (!isMounted) {
          return;
        }

        setProjectDetail(response);
      } catch {
        if (!isMounted) {
          return;
        }

        setProjectDetail(null);
      } finally {
        if (isMounted) {
          setHasLoadedProjectDetail(true);
          setIsLoadingProjectDetail(false);
        }
      }
    };

    void loadProjectDetail();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !selectedFolderId) {
      return;
    }

    let isMounted = true;

    const loadFiles = async () => {
      setIsLoadingFiles(true);

      try {
        const allFiles = await getAllFilesApi();
        const currentTenantId = authData?.tenantId?.trim() ?? "";
        const visibleFiles = allFiles
          .filter((file) => !file.deletedAt)
          .filter((file) => file.folderId === selectedFolderId)
          .filter((file) => !currentTenantId || file.tenantId === currentTenantId)
          .map(toFileItem);

        if (isMounted) {
          setUploadedFilesByProject((currentMap) => ({
            ...currentMap,
            [projectId]: visibleFiles,
          }));
        }
      } catch {
        if (isMounted) {
          setUploadedFilesByProject((currentMap) => ({
            ...currentMap,
            [projectId]: [],
          }));
        }
      } finally {
        if (isMounted) {
          setIsLoadingFiles(false);
        }
      }
    };

    void loadFiles();

    return () => {
      isMounted = false;
    };
  }, [authData?.tenantId, projectId, selectedFolderId]);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    void loadFolders().catch((error) => {
      toast.error(error instanceof Error ? error.message : "Unable to load project folders.");
    });
  }, [loadFolders, projectId]);

  const fetchTenantUsers = useCallback(async (keyword: string): Promise<IUserTenantOption[]> => {
    try {
      const users = await getTenantUserOptions({
        page: 0,
        offset: 100,
      });

      const normalizedKeyword = keyword.trim().toLowerCase();
      const filteredUsers = normalizedKeyword
        ? users.filter((userItem) => {
          return (
            userItem.name.toLowerCase().includes(normalizedKeyword) ||
            userItem.email.toLowerCase().includes(normalizedKeyword)
          );
        })
        : users;

      return filteredUsers;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load tenant users.");
      return [];
    }
  }, []);

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      await renameFolderApi(folderId, newName);
      toast.success("Folder renamed successfully");
      void loadFolders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolderByActorApi(folderId);
      toast.success("Folder deleted successfully");
      void loadFolders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete folder");
    }
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    try {
      await renameFileApi(fileId, newName);
      toast.success("File renamed successfully");
      if (projectId && selectedFolderId) {
        const refreshedFiles = await getAllFilesApi();
        const currentTenantId = authData?.tenantId?.trim() ?? "";
        const visibleFiles = refreshedFiles
          .filter((file) => !file.deletedAt)
          .filter((file) => file.folderId === selectedFolderId)
          .filter((file) => !currentTenantId || file.tenantId === currentTenantId)
          .map(toFileItem);

        setUploadedFilesByProject((currentMap) => ({
          ...currentMap,
          [projectId]: visibleFiles,
        }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename file");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFileApi(fileId);
      toast.success("File deleted successfully");
      if (projectId) {
        setUploadedFilesByProject((currentMap) => ({
          ...currentMap,
          [projectId]: (currentMap[projectId] ?? []).filter((file) => file.id !== fileId),
        }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete file");
    }
  };

  const handleSubmitAddUser = async (input: { memberUserId: string; permission: number }) => {
    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }

    setIsSubmittingAddUser(true);

    try {
      const response = await assignProjectMember({
        projectId,
        memberUserId: input.memberUserId,
        permission: input.permission,
      });

      toast.success("User added to project successfully", {
        description: `${response.userName} added with permission level ${response.permission}`,
      });

      setIsAddUserModalOpen(false);
      const members = await getProjectMembers(projectId);
      setProjectMembers(members);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add user to project";
      toast.error("Failed to add user", {
        description: errorMessage,
      });
    } finally {
      setIsSubmittingAddUser(false);
    }
  };

  const loadProjectMembers = useCallback(async () => {
    if (!projectId) {
      return;
    }

    try {
      const members = await getProjectMembers(projectId);
      setProjectMembers(members);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load project members.");
    }
  }, [projectId]);

  const handleUpdateProjectMemberPermission = async (
    memberUserId: string,
    permission: number
  ) => {
    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }

    setIsSubmittingMemberAction(true);

    try {
      const response = await updateProjectMemberPermission({
        projectId,
        memberUserId,
        permission,
      });

      toast.success("Permission updated successfully", {
        description: `${response.userName} updated with permission level ${response.permission}`,
      });

      await loadProjectMembers();
    } catch (error) {
      toast.error("Failed to update permission", {
        description: error instanceof Error ? error.message : "Unable to update member permission.",
      });
    } finally {
      setIsSubmittingMemberAction(false);
    }
  };

  const handleRemoveProjectMember = async (memberUserId: string) => {
    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }

    const member = projectMembers.find((item) => item.userId === memberUserId);
    setIsSubmittingMemberAction(true);

    try {
      await removeProjectMember({
        projectId,
        memberUserId,
      });

      toast.success("User removed from project", {
        description: member ? `${member.userName} removed successfully` : "Member removed successfully",
      });

      await loadProjectMembers();
    } catch (error) {
      toast.error("Failed to remove user", {
        description: error instanceof Error ? error.message : "Unable to remove member from project.",
      });
    } finally {
      setIsSubmittingMemberAction(false);
    }
  };

  if (!projectDetail) {
    if (!projectId) {
      return null;
    }

    if (isLoadingProjectDetail) {
      return (
        <div className="rounded-md border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Loading project details...
        </div>
      );
    }

    if (hasLoadedProjectDetail) {
      return (
        <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          Project not found. Please verify the project ID.
        </div>
      );
    }

    return null;
  }

  const handleCreateFolderWithAcl = async (input: {
    nameFolder: string;
    path?: string;
    parentFolderId?: string | null;
    aclEntries?: ICreateFolderWithAclRequest["aclEntries"];
  }) => {
    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }

    try {
      const response = await createFolder({
        nameFolder: input.nameFolder,
        path: input.path,
        parentFolderId: input.parentFolderId,
        aclEntries: input.aclEntries,
      });

      toast.success("Create folder successfully", {
        description: `${response.folder.nameFolder} created with ${(response.aclEntries ?? []).length} ACL rule(s)`,
      });

      setIsCreateFolderModalOpen(false);
    } catch (error) {
      toast.error("Failed to create folder", {
        description: error instanceof Error ? error.message : "Unable to create folder with ACL.",
      });
      throw error;
    }
  };

  const handleUploadFiles = async (uploadedFileList: FileList | null) => {
    if (!projectId || !uploadedFileList || uploadedFileList.length === 0) {
      return;
    }

    const tenantId = authData?.tenantId?.trim() ?? "";
    const ownerId = authData?.userId?.trim() ?? "";

    if (!tenantId || !ownerId) {
      toast.error("Missing tenant or owner information. Please sign in again.");
      return;
    }

    if (!selectedFolderId) {
      toast.error("Please select a folder before uploading files.");
      return;
    }

    try {
      for (const fileItem of Array.from(uploadedFileList)) {
        await createFileApi({
          nameFile: fileItem.name,
          statusFile: "DRAFT" as TFileStatus,
          sizeFile: fileItem.size / (1024 * 1024),
          extraInfo: null,
          tenantId,
          folderId: selectedFolderId,
          ownerId,
          lockedByUserId: null,
        });
      }

      toast.success("File uploaded successfully");

      const refreshedFiles = await getAllFilesApi();
      const visibleFiles = refreshedFiles
        .filter((file) => !file.deletedAt)
        .filter((file) => file.folderId === selectedFolderId)
        .filter((file) => file.tenantId === tenantId)
        .map(toFileItem);

      setUploadedFilesByProject((currentMap) => ({
        ...currentMap,
        [projectId]: visibleFiles,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    }
  };

  const handleOpenFolderDetail = (folderItem: IProjectFolderItem) => {
    if (!projectId) {
      return;
    }

    if (folderItem.isVirtual) {
      toast.info("This is a default sample folder. Create a real folder to open details.");
      return;
    }

    setActiveFolderId(folderItem.id);
    navigate(getProjectFolderPath(projectId, folderItem.id));
  };


  return (
    <div className="project-shell relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-cyan-50/60 dark:from-slate-900 dark:via-slate-800 dark:to-cyan-900/20 px-4 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -right-16 top-6 h-44 w-44 rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-40 h-52 w-52 rounded-full bg-blue-200/20 blur-3xl" />

      <div className="relative space-y-8">
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-cyan-50/70 dark:from-slate-900 dark:via-slate-800/50 dark:to-cyan-900/20 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  <Sparkles className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl" />
                  {displayProjectName}
                </div>
              </div>

              <ProjectFolderActions
                showAddUserButton={projectDetail.currentUserCanManageMembers}
                onAddUser={() => setIsAddUserModalOpen(true)}
                showViewUsersButton
                onViewUsers={() => {
                  setIsProjectMembersModalOpen(true);
                  void loadProjectMembers();
                }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Folders</h2>
              <p className="mt-1 text-sm text-slate-500">Pick a folder to browse, star, rename, or delete.</p>
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              onClick={() => setIsCreateFolderModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>New Folder</span>
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {folderItems.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No folders yet. Create the first workspace folder to start organizing files.
              </div>
            ) : (
              folderItems.map((folderItem) => {
                const canWrite = projectDetail.currentUserIsOwner || projectDetail.currentUserCanManageMembers;
                const canDelete = projectDetail.currentUserIsOwner || projectDetail.currentUserCanManageMembers;
                return (
                  <ProjectFolderCard
                    key={folderItem.id}
                    folderId={folderItem.id}
                    name={folderItem.name}
                    filesCount={folderItem.filesCount}
                    isActive={folderItem.id === selectedFolderId}
                    isStarred={isFolderStarred(folderItem.id)}
                    isStarLoading={isLoadingStars}
                    onClick={() => handleOpenFolderDetail(folderItem)}
                    onToggleStar={() => void toggleFolderStar(folderItem.id)}
                    menuActions={{
                      folderId: folderItem.id,
                      canWrite,
                      canDelete,
                      onRename: handleRenameFolder,
                      onDelete: handleDeleteFolder,
                    }}
                  />
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Files</h2>
              <p className="mt-1 text-sm text-slate-500">Files open in a clean table with direct file navigation.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-slate-500 sm:flex">
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium transition",
                    viewMode === "list" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm" : "hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50"
                  )}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium transition",
                    viewMode === "grid" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm" : "hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50"
                  )}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 dark:hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-800 dark:hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => fileUploadRef.current?.click()}
                disabled={isLoadingFiles}
              >
                <Upload className="h-4 w-4" />
                <span>{isLoadingFiles ? "Refreshing..." : "Upload File"}</span>
              </button>
            </div>
          </div>

          <input
            ref={fileUploadRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              handleUploadFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
          <input
            ref={folderUploadRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              handleUploadFiles(event.target.files);
              event.currentTarget.value = "";
            }}
            {...({ webkitdirectory: "" } as unknown as Record<string, string>)}
          />

          <div className="mt-5">
            {fileItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No files in this folder yet. Upload a file to get started.
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 px-4 pb-6">
                {fileItems.map((fileItem) => {
                  const canWrite = projectDetail.currentUserIsOwner || projectDetail.currentUserCanManageMembers;
                  const canDelete = projectDetail.currentUserIsOwner || projectDetail.currentUserCanManageMembers;
                  return (
                    <ProjectFileCard
                      key={fileItem.id}
                      fileId={fileItem.id}
                      name={fileItem.name}
                      size={fileItem.size}
                      lastModified={fileItem.lastModified}
                      fileType={fileItem.type}
                      isStarred={isFileStarred(fileItem.id)}
                      isStarLoading={isLoadingStars}
                      onClick={() => {
                        if (!projectId || !fileItem.id) {
                          return;
                        }
                        navigate(getProjectFilePath(projectId, fileItem.id));
                      }}
                      onToggleStar={() => void toggleFileStar(fileItem.id)}
                      menuActions={{
                        fileId: fileItem.id,
                        canWrite,
                        canDelete,
                        onRename: handleRenameFile,
                        onDelete: handleDeleteFile,
                      }}
                    />
                  );
                })}
              </div>
            ) : (
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
                    {fileItems.map((fileItem) => {
                      const canWrite = projectDetail.currentUserIsOwner || projectDetail.currentUserCanManageMembers;
                      const canDelete = projectDetail.currentUserIsOwner || projectDetail.currentUserCanManageMembers;
                      return (
                        <ProjectFileRow
                          key={fileItem.id}
                          fileId={fileItem.id}
                          name={fileItem.name}
                          owner={fileItem.owner === authData?.userId ? "Me" : fileItem.owner}
                          lastModified={new Date(fileItem.lastModified).toLocaleString()}
                          size={fileItem.size}
                          fileType={fileItem.type}
                          isStarred={isFileStarred(fileItem.id)}
                          isStarLoading={isLoadingStars}
                          onToggleStar={() => void toggleFileStar(fileItem.id)}
                          onClick={() => {
                            if (!projectId || !fileItem.id) {
                              return;
                            }
                            navigate(getProjectFilePath(projectId, fileItem.id));
                          }}
                          menuActions={{
                            fileId: fileItem.id,
                            canWrite,
                            canDelete,
                            onRename: handleRenameFile,
                            onDelete: handleDeleteFile,
                          }}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <AddProjectMemberModal
          isOpen={isAddUserModalOpen}
          isSubmitting={isSubmittingAddUser}
          projectName={displayProjectName}
          fetchUsers={fetchTenantUsers}
          onClose={() => setIsAddUserModalOpen(false)}
          onSubmit={handleSubmitAddUser}
        />
        <CreateProjectFolderModal
          projectId={projectId ?? ""}
          isOpen={isCreateFolderModalOpen}
          isSubmitting={isCreatingFolder}
          onClose={() => setIsCreateFolderModalOpen(false)}
          onSubmit={handleCreateFolderWithAcl}
        />
        <ProjectMembersModal
          isOpen={isProjectMembersModalOpen}
          isSubmitting={isSubmittingMemberAction}
          projectName={displayProjectName}
          ownerUserId={projectDetail.ownerId}
          currentUserCanManageMembers={projectDetail.currentUserCanManageMembers}
          members={projectMembers}
          onClose={() => setIsProjectMembersModalOpen(false)}
          onUpdatePermission={handleUpdateProjectMemberPermission}
          onDeleteMember={handleRemoveProjectMember}
        />
      </div>
    </div>
  );
};
