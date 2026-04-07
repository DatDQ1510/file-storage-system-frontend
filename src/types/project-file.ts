export interface IProjectFileVersion {
  id: string;
  label: string;
  title: string;
  submittedAt: string;
}

export interface IProjectFileActivity {
  id: string;
  actor: string;
  message: string;
  timeLabel: string;
}

export interface IProjectFileDetail {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  fileTypeLabel: string;
  owner: string;
  sizeLabel: string;
  dimensionsLabel: string;
  createdLabel: string;
  modifiedLabel: string;
  complianceTitle: string;
  complianceDescription: string;
  permissions: string[];
  versions: IProjectFileVersion[];
  activityItems: IProjectFileActivity[];
}
