export interface IStarredFolder {
  id: string;
  name: string;
  filesCount: number;
  size: string;
}

export interface IStarredFile {
  id: string;
  name: string;
  dateLabel: string;
  size: string;
  type: "pdf" | "excel" | "image" | "presentation";
}

export interface IAuditStreamItem {
  id: string;
  message: string;
  timeLabel: string;
}

export interface IStarredPageData {
  folders: IStarredFolder[];
  files: IStarredFile[];
  auditItems: IAuditStreamItem[];
}
