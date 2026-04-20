import type { IProjectFileDetail } from "@/types/project-file";

// Mock data removed - using real API endpoints instead
export const PROJECT_FILE_ITEMS: IProjectFileDetail[] = [];

export const getProjectFilePathByIds = (projectId: string, fileId: string) => {
  return `/projects/${projectId}/files/${fileId}`;
};

