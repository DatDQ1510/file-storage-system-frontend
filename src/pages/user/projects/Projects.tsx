import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LayoutGrid, List } from "lucide-react";
import { PROJECT_ITEMS } from "@/constants/projects";
import { getProjectPath, getProjectFilePath, getProjectFolderPath } from "@/constants/routes";
import { PROJECT_FILE_ITEMS } from "@/constants/project-files";
import { ProjectFolderActions } from "@/components/projects/ProjectFolderActions";
import { ProjectFolderCard } from "@/components/projects/ProjectFolderCard";
import {
  ProjectFileTypeIcon,
  type TProjectFileType,
} from "@/components/projects/ProjectFileTypeIcon";

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
  const fileUploadRef = useRef<HTMLInputElement | null>(null);
  const folderUploadRef = useRef<HTMLInputElement | null>(null);

  const selectedProject = PROJECT_ITEMS.find((projectItem) => {
    return projectItem.id === projectId;
  });

  const projectDetailFile = useMemo(() => {
    return PROJECT_FILE_ITEMS.find((fileItem) => {
      return fileItem.projectId === projectId;
    });
  }, [projectId]);

  const baseFolderItems = useMemo<IProjectFolderListItem[]>(() => {
    if (!selectedProject) {
      return [];
    }

    return selectedProject.folders.map((folderItem) => {
      return {
        id: folderItem.id,
        name: folderItem.name,
        filesCount: folderItem.filesCount,
      };
    });
  }, [selectedProject]);

  const createdFolderItems = useMemo<IProjectFolderListItem[]>(() => {
    if (!projectId) {
      return [];
    }

    return createdFoldersByProject[projectId] ?? [];
  }, [createdFoldersByProject, projectId]);

  const folderItems = useMemo<IProjectFolderListItem[]>(() => {
    return [...baseFolderItems, ...createdFolderItems];
  }, [baseFolderItems, createdFolderItems]);

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

    return [
      ...baseFileItems,
      ...(uploadedFilesByProject[projectId] ?? []),
    ];
  }, [
    projectDetailFile?.name,
    projectId,
    selectedProject?.projectLead,
    uploadedFilesByProject,
  ]);

  useEffect(() => {
    if (!projectId && PROJECT_ITEMS.length > 0) {
      navigate(getProjectPath(PROJECT_ITEMS[0].id), { replace: true });
      return;
    }

    if (projectId && !selectedProject && PROJECT_ITEMS.length > 0) {
      navigate(getProjectPath(PROJECT_ITEMS[0].id), { replace: true });
    }
  }, [navigate, projectId, selectedProject]);

  if (!selectedProject) {
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

  const handleOpenDetailPage = () => {
    if (!projectId || !projectDetailFile) {
      return;
    }

    navigate(getProjectFilePath(projectId, projectDetailFile.id));
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
              Architectural Archive
            </h1>
          </div>

          <ProjectFolderActions
            onCreateFolder={handleCreateFolder}
            onUploadFolder={() => folderUploadRef.current?.click()}
            onUploadFile={() => fileUploadRef.current?.click()}
          />
        </div>

        <div className="rounded-md border border-border bg-card px-5 py-4">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Project</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{selectedProject.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Category</p>
              <p className="mt-1 font-medium text-foreground">{selectedProject.category}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Project Lead</p>
              <div className="mt-1 flex items-center gap-2 text-foreground">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                  {selectedProject.projectLead
                    .split(" ")
                    .map((namePart) => namePart[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="font-medium">{selectedProject.projectLead}</span>
              </div>
            </div>
            <div className="flex sm:justify-start lg:justify-end">
              <span className="inline-flex h-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {selectedProject.status}
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
            className="text-xs font-semibold text-blue-700"
            onClick={handleOpenDetailPage}
          >
            View All
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
          <div />
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
                const isPreviewFile = fileItem.type === "pdf" && !!projectDetailFile;

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
