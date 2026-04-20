import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LayoutGrid, List, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { getProjectFilePath, getProjectFolderPath } from "@/constants/routes";
import { AddProjectMemberModal } from "@/components/projects/AddProjectMemberModal";
import { ProjectFolderActions } from "@/components/projects/ProjectFolderActions";
import { ProjectFolderCard } from "@/components/projects/ProjectFolderCard";
import {
  ProjectFileTypeIcon,
  type TProjectFileType,
} from "@/components/projects/ProjectFileTypeIcon";
import { getStoredAuthData } from "@/lib/api/auth-service";
import {
  assignProjectMember,
  getTenantUserOptions,
  getUserProjectDetail,
  type IUserProjectDetail,
  type IUserTenantOption,
} from "@/lib/api/user-project-service";

interface IProjectFolderListItem {
  id: string;
  name: string;
  filesCount: number;
}

interface IProjectFileListItem {
  id: string;
  name: string;
  owner: string;
  lastModified: string;
  size: string;
  type: TProjectFileType;
}

export const Projects = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [createdFoldersByProject, setCreatedFoldersByProject] = useState<Record<string, IProjectFolderListItem[]>>({});
  const [activeFolderId, setActiveFolderId] = useState<string>("");
  const [editingFolderId, setEditingFolderId] = useState<string>("");
  const [uploadedFilesByProject, setUploadedFilesByProject] = useState<Record<string, IProjectFileListItem[]>>({});
  const [projectDetail, setProjectDetail] = useState<IUserProjectDetail | null>(null);
  const [hasLoadedProjectDetail, setHasLoadedProjectDetail] = useState(false);
  const [isLoadingProjectDetail, setIsLoadingProjectDetail] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isSubmittingAddUser, setIsSubmittingAddUser] = useState(false);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);
  const folderUploadRef = useRef<HTMLInputElement | null>(null);
  const authData = getStoredAuthData();
  const currentUserId = authData?.userId?.trim() ?? "";

  const isCurrentUserProjectOwner = useMemo(() => {
    if (!projectDetail?.ownerId || !currentUserId) {
      return false;
    }

    return projectDetail.ownerId === currentUserId;
  }, [currentUserId, projectDetail?.ownerId]);

  const displayProjectName = projectDetail?.name || "Project Workspace";
  const displayProjectCategory = projectDetail?.department || "General";
  const displayProjectLead = projectDetail?.ownerName || "Project Owner";
  const displayProjectStatus =
    (projectDetail?.status || "active").toString().toUpperCase();

  const createdFolderItems = useMemo<IProjectFolderListItem[]>(() => {
    if (!projectId) {
      return [];
    }

    return createdFoldersByProject[projectId] ?? [];
  }, [createdFoldersByProject, projectId]);

  const folderItems = useMemo<IProjectFolderListItem[]>(() => {
    return createdFolderItems;
  }, [createdFolderItems]);

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add user to project";
      toast.error("Failed to add user", {
        description: errorMessage,
      });
    } finally {
      setIsSubmittingAddUser(false);
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

  const handleCreateFolder = () => {
    if (!projectId) {
      return;
    }

    const nextFolderCount = createdFolderItems.length + 1;
    const folderId = `new-folder-${Date.now()}`;
    const folderName = nextFolderCount === 1 ? "New Project" : `New Project ${nextFolderCount}`;

    setCreatedFoldersByProject((currentMap) => {
      const projectFolders = currentMap[projectId] ?? [];

      return {
        ...currentMap,
        [projectId]: [
          ...projectFolders,
          {
            id: folderId,
            name: folderName,
            filesCount: 0,
          },
        ],
      };
    });

    setActiveFolderId(folderId);
    setEditingFolderId(folderId);
  };

  const handleRenameFolder = (folderId: string, nextName: string) => {
    if (!projectId) {
      return;
    }

    setCreatedFoldersByProject((currentMap) => {
      const projectFolders = currentMap[projectId] ?? [];

      return {
        ...currentMap,
        [projectId]: projectFolders.map((folderItem) => {
          if (folderItem.id !== folderId) {
            return folderItem;
          }

          return {
            ...folderItem,
            name: nextName,
          };
        }),
      };
    });

    setEditingFolderId("");
  };

  const resolveFileTypeFromFileName = (fileName: string): TProjectFileType => {
    if (fileName.endsWith(".pdf")) {
      return "pdf";
    }

    if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
      return "docx";
    }

    if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
      return "xlsx";
    }

    return "png";
  };

  const formatFileSize = (rawFileSize: number) => {
    if (rawFileSize < 1024 * 1024) {
      return `${Math.max(1, Math.round(rawFileSize / 1024))} KB`;
    }

    return `${(rawFileSize / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUploadFiles = (uploadedFileList: FileList | null) => {
    if (!projectId || !uploadedFileList) {
      return;
    }

    const uploadedItems = Array.from(uploadedFileList).map((fileItem) => {
      return {
        id: `uploaded-${fileItem.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: fileItem.name,
        owner: "Me",
        lastModified: "Just now",
        size: formatFileSize(fileItem.size),
        type: resolveFileTypeFromFileName(fileItem.name.toLowerCase()),
      } as IProjectFileListItem;
    });

    setUploadedFilesByProject((currentMap) => {
      const existingFiles = currentMap[projectId] ?? [];

      return {
        ...currentMap,
        [projectId]: [...uploadedItems, ...existingFiles],
      };
    });
  };

  const handleOpenFolderDetail = (folderItem: IProjectFolderListItem) => {
    if (!projectId) {
      return;
    }

    setActiveFolderId(folderItem.id);
    navigate(getProjectFolderPath(projectId, folderItem.id));
  };


  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="max-w-[320px] text-4xl font-semibold leading-tight text-blue-700">
              {displayProjectName}
            </h1>
          </div>

          <ProjectFolderActions
            showAddUserButton={isCurrentUserProjectOwner}
            onAddUser={() => setIsAddUserModalOpen(true)}
          />
        </div>

        <div className="rounded-md border border-border bg-card px-5 py-4">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Project</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{displayProjectName}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Category</p>
              <p className="mt-1 font-medium text-foreground">{displayProjectCategory}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Project Lead</p>
              <div className="mt-1 flex items-center gap-2 text-foreground">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                  {displayProjectLead
                    .split(" ")
                    .map((namePart) => namePart[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="font-medium">{displayProjectLead}</span>
              </div>
            </div>
            <div className="flex sm:justify-start lg:justify-end">
              <span className="inline-flex h-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {displayProjectStatus}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground">Folders</h2>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
            onClick={handleCreateFolder}
          >
            <Plus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {folderItems.map((folderItem) => {
            return (
              <ProjectFolderCard
                key={folderItem.id}
                name={folderItem.name}
                filesCount={folderItem.filesCount}
                isActive={folderItem.id === selectedFolderId}
                isEditing={folderItem.id === editingFolderId}
                onClick={() => handleOpenFolderDetail(folderItem)}
                onNameSubmit={(nextName) => handleRenameFolder(folderItem.id, nextName)}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground">Files</h2>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            onClick={() => fileUploadRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
          </button>
        </div>

        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3 text-muted-foreground">
            <button type="button" className="transition-colors hover:text-blue-700" aria-label="List view">
              <List className="h-4 w-4" />
            </button>
            <button type="button" className="text-blue-700" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
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
              {fileItems.map((fileItem) => {
                const isPreviewFile = fileItem.type === "pdf";

                return (
                  <tr
                    key={fileItem.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className="flex items-center gap-3 text-left"
                        onClick={() => {
                          if (!isPreviewFile || !projectId || !fileItem.id) {
                            return;
                          }

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
              })}
            </tbody>
          </table>
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
    </div>
  );
};
