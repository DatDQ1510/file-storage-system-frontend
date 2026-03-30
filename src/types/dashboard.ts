export interface IQuickAccessFile {
  id: string;
  name: string;
  type: string;
  size: string;
  dateModified: string;
  icon: string;
}

export interface IRecentActivity {
  id: string;
  type: "audit" | "share" | "sync";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  user?: string;
}

export interface IStorageSummary {
  usedSpace: string;
  totalSpace: string;
  percentUsed: number;
  media: string;
  docs: string;
}

export interface ISuggestedProject {
  id: string;
  name: string;
  description: string;
  status: "active" | "in-review" | "planning";
  lastActivity: string;
  members?: number;
  icon: string;
}

export interface IDashboardData {
  greeting: string;
  auditRequests: number;
  quickAccessFiles: IQuickAccessFile[];
  recentActivities: IRecentActivity[];
  storage: IStorageSummary;
  suggestedProjects: ISuggestedProject[];
}
