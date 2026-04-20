import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { PROJECT_ITEMS } from "@/constants/projects";
import { getProjectPath, getProjectFilePath } from "@/constants/routes";
import { PROJECT_FILE_ITEMS } from "@/constants/project-files";
import { AddProjectMemberModal } from "@/components/projects/AddProjectMemberModal";
import { ProjectFileTypeIcon, type TProjectFileType } from "@/components/projects/ProjectFileTypeIcon";
import { ProjectFolderActions } from "@/components/projects/ProjectFolderActions";
import { getStoredAuthData } from "@/lib/api/auth-service";
import {
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
  const ownerSearchRequestSequenceRef = useRef(0);
  const [uploadedFilesByProject, setUploadedFilesByProject] = useState<Record<string, IProjectFileListItem[]>>({});
  const [projectDetail, setProjectDetail] = useState<IUserProjectDetail | null>(null);
  const [isLoadingProjectDetail, setIsLoadingProjectDetail] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isSubmittingAddUser, setIsSubmittingAddUser] = useState(false);
  const [isSearchingTenantUsers, setIsSearchingTenantUsers] = useState(false);
  const [tenantUserOptions, setTenantUserOptions] = useState<IUserTenantOption[]>([]);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);
  const folderUploadRef = useRef<HTMLInputElement | null>(null);
  const authData = getStoredAuthData();
  const currentUserId = authData?.userId?.trim() ?? "";

  const selectedProject = PROJECT_ITEMS.find((projectItem) => {
    return projectItem.id === projectId;
  });

  const selectedFolder = selectedProject?.folders.find((folderItem) => {
    return folderItem.id === folderId;
  });

  const isCurrentUserProjectOwner = useMemo(() => {
    if (!projectDetail?.ownerId || !currentUserId) {
      return false;
    }

    return projectDetail.ownerId === currentUserId;
  }, [currentUserId, projectDetail?.ownerId]);

  const projectDetailFile = useMemo(() => {
    return PROJECT_FILE_ITEMS.find((fileItem) => {
      return fileItem.projectId === projectId;
    });
  }, [projectId]);

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
    const baseFileItems: IProjectFileListItem[] = [
      {
        id: "file-1",
        name: projectDetailFile?.name ?? "Architectural_Brief_v2.pdf",
        owner: selectedProject?.projectLead ?? "Sarah Chen",
        lastModified: "Oct 24, 2023",
        size: "4.2 MB",
        type: "pdf",
      },
      {
        id: "file-2",
        name: "Titan_Infrastructure_Status.docx",
        owner: "Me",
        lastModified: "2 hours ago",
        size: "1.8 MB",
        type: "docx",
      },
      {
        id: "file-3",
        name: "Budget_Projections_Q4.xlsx",
        owner: "Finance Dept",
        lastModified: "Yesterday",
        size: "850 KB",
        type: "xlsx",
      },
      {
        id: "file-4",
        name: "Site_Blueprint_Primary.png",
        owner: "Me",
        lastModified: "Oct 20, 2023",
        size: "12.5 MB",
        type: "png",
      },
    ];

    if (!projectId) {
      return baseFileItems;
    }

    return [...baseFileItems, ...(uploadedFilesByProject[projectId] ?? [])];
  }, [projectDetailFile?.name, projectId, selectedProject?.projectLead, uploadedFilesByProject]);

  useEffect(() => {
    if (!projectId && PROJECT_ITEMS.length > 0) {
      navigate(getProjectPath(PROJECT_ITEMS[0].id), { replace: true });
      return;
    }

    if (projectId && !selectedProject && PROJECT_ITEMS.length > 0) {
      navigate(getProjectPath(PROJECT_ITEMS[0].id), { replace: true });
      return;
    }

    if (selectedProject && folderId && !selectedFolder) {
      navigate(getProjectPath(selectedProject.id), { replace: true });
    }
  }, [folderId, navigate, projectId, selectedFolder, selectedProject]);

  if (!selectedProject || !selectedFolder) {
    if (isLoadingProjectDetail) {
      return (
        <div className="rounded-md border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Loading project details...
        </div>
      );
    }

    return null;
  }

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

  const handleCreateFolder = () => {
    navigate(getProjectPath(selectedProject.id));
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

  const handleSearchTenantUsers = async (keyword: string) => {
    const requestSequence = ownerSearchRequestSequenceRef.current + 1;
    ownerSearchRequestSequenceRef.current = requestSequence;
    setIsSearchingTenantUsers(true);

    try {
      const users = await getTenantUserOptions({
        page: 0,
        offset: 100,
      });

      if (requestSequence !== ownerSearchRequestSequenceRef.current) {
        return;
      }

      const normalizedKeyword = keyword.trim().toLowerCase();
      const filteredUsers = normalizedKeyword
        ? users.filter((userItem) => {
            return (
              userItem.name.toLowerCase().includes(normalizedKeyword) ||
              userItem.email.toLowerCase().includes(normalizedKeyword)
            );
          })
        : users;

      setTenantUserOptions(filteredUsers);
    } catch (error) {
      if (requestSequence !== ownerSearchRequestSequenceRef.current) {
        return;
      }

      setTenantUserOptions([]);
      toast.error(error instanceof Error ? error.message : "Unable to load tenant users.");
    } finally {
      if (requestSequence === ownerSearchRequestSequenceRef.current) {
        setIsSearchingTenantUsers(false);
      }
    }
  };

  const handleSubmitAddUser = async () => {
    setIsSubmittingAddUser(true);

    try {
      toast.success("Ready to add member", {
        description: "Backend add-member endpoint is wired in tenant-admin flow.",
      });
      setIsAddUserModalOpen(false);
    } finally {
      setIsSubmittingAddUser(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {selectedProject.name} / {selectedFolder.name}
            </p>
            <h1 className="text-3xl font-semibold text-blue-700">Folder Detail</h1>
          </div>

          <ProjectFolderActions
            onCreateFolder={handleCreateFolder}
            onUploadFolder={() => folderUploadRef.current?.click()}
            onUploadFile={() => fileUploadRef.current?.click()}
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
          isSearchingUsers={isSearchingTenantUsers}
          userOptions={tenantUserOptions}
          onSearchUsers={handleSearchTenantUsers}
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
                const isPreviewFile = fileItem.type === "pdf" && !!projectDetailFile;

                return (
                  <tr key={fileItem.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className="flex items-center gap-3 text-left"
                        onClick={() => {
                          if (!isPreviewFile || !projectId || !projectDetailFile) {
                            return;
                          }

                          navigate(getProjectFilePath(projectId, projectDetailFile.id));
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
