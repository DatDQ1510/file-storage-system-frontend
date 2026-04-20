import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { getProjectFilePath } from "@/constants/routes";
import { AddProjectMemberModal } from "@/components/projects/AddProjectMemberModal";
import { ProjectFileTypeIcon, type TProjectFileType } from "@/components/projects/ProjectFileTypeIcon";
import { ProjectFolderActions } from "@/components/projects/ProjectFolderActions";
import { getStoredAuthData } from "@/lib/api/auth-service";
import {
  assignProjectMember,
  getTenantUserOptions,
  getUserProjectDetail,
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

export const ProjectFolderDetail = () => {
  const navigate = useNavigate();
  const { projectId, folderId } = useParams();
  const [uploadedFilesByProject, setUploadedFilesByProject] = useState<Record<string, IProjectFileListItem[]>>({});
  const [projectDetail, setProjectDetail] = useState<IUserProjectDetail | null>(null);
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

  useEffect(() => {
    if (!projectId) {
      setProjectDetail(null);
      return;
    }

    let isMounted = true;

    const loadProjectDetail = async () => {
      setIsLoadingProjectDetail(true);

      try {
        const response = await getUserProjectDetail(projectId);

        if (isMounted) {
          setProjectDetail(response);
        }
      } catch {
        if (isMounted) {
          setProjectDetail(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProjectDetail(false);
        }
      }
    };

    void loadProjectDetail();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const fileItems = useMemo<IProjectFileListItem[]>(() => {
    if (!projectId) {
      return [];
    }

    return uploadedFilesByProject[projectId] ?? [];
  }, [projectId, uploadedFilesByProject]);

  useEffect(() => {
    if (!projectId) {
      setProjectDetail(null);
      return;
    }

    let isMounted = true;

    const loadProjectDetail = async () => {
      setIsLoadingProjectDetail(true);

      try {
        const response = await getUserProjectDetail(projectId);

        if (isMounted) {
          setProjectDetail(response);
        }
      } catch {
        if (isMounted) {
          setProjectDetail(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProjectDetail(false);
        }
      }
    };

    void loadProjectDetail();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Folder details would come from API - for now, display project content
  const displayFolderName = folderId || "All Files";

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

  if (!projectId || !projectDetail) {
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

    if (projectDetail === null) {
      return (
        <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          Project not found. Please verify the project ID.
        </div>
      );
    }

    return null;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {projectDetail?.name} / {displayFolderName}
            </p>
            <h1 className="text-3xl font-semibold text-blue-700">Folder Detail</h1>
          </div>

          <ProjectFolderActions
            showAddUserButton={isCurrentUserProjectOwner}
            onAddUser={() => setIsAddUserModalOpen(true)}
          />
        </div>
      </section>

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

        <AddProjectMemberModal
          isOpen={isAddUserModalOpen}
          isSubmitting={isSubmittingAddUser}
          projectName={projectDetail.name}
          fetchUsers={fetchTenantUsers}
          onClose={() => setIsAddUserModalOpen(false)}
          onSubmit={handleSubmitAddUser}
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
                  <tr key={fileItem.id} className="border-b border-border last:border-b-0">
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
    </div>
  );
};
