export type TProjectStatus = "active" | "archived";

export interface IProjectMember {
  id: string;
  name: string;
  initials: string;
}

export interface IProjectCard {
  id: string;
  name: string;
  category: string;
  projectLead: IProjectMember;
  collaborator: IProjectMember;
  modifiedLabel: string;
  filesCount: number;
  status: TProjectStatus;
  iconType: "infrastructure" | "analytics" | "legacy" | "security" | "marketing";
  isOnline: boolean;
}

export interface IProjectActivity {
  id: string;
  message: string;
  metadata: string;
}

export interface IProjectsPageData {
  projects: IProjectCard[];
  activities: IProjectActivity[];
}
