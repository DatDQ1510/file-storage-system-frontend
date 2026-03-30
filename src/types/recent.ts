export interface IRecentFileItem {
  id: string;
  name: string;
  location: string;
  timeLabel: string;
  size: string;
  type: "pdf" | "image" | "csv" | "video" | "folder";
}

export interface IRecentFileGroup {
  id: string;
  label: string;
  files: IRecentFileItem[];
}

export interface IRecentPageData {
  groups: IRecentFileGroup[];
}
