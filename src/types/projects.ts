export type TProjectStatus = "active" | "archived";

export interface IProjectFolder {
  id: string;
  name: string;
  filesCount: number;
  updatedLabel: string;
}

export interface IProjectItem {
  id: string;
  name: string;
  category: string;
  status: TProjectStatus;
  projectLead: string;
  updatedLabel: string;
  totalFiles: number;
  description: string;
  folders: IProjectFolder[];
}
