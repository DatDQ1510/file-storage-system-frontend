export interface IStarredFolderItem {
  id: string;
  name: string;
  path: string;
  projectId: string;
  starredAt: string;
  updatedAt: string;
}

export interface IStarredFileItem {
  id: string;
  name: string;
  folderId: string;
  folderPath: string;
  projectId: string;
  size: string;
  type: "pdf" | "excel" | "image" | "presentation";
  starredAt: string;
  updatedAt: string;
}

export interface IStarredPageData {
  folders: IStarredFolderItem[];
  files: IStarredFileItem[];
}
