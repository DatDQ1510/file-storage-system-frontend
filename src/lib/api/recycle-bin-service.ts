import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"

export interface IRecycleBinFileResponse {
  id: string
  fileName: string
  sizeFile: number
  statusFile: string
  folderId: string
  folderPath: string
  projectId: string
  deletedAt: string
  updatedAt: string
}

export const getRecycleBinFilesApi = async (): Promise<IRecycleBinFileResponse[]> => {
  const response = await api.get<IApiResponse<IRecycleBinFileResponse[]>>("/files/recycle-bin", {
    skipGlobalErrorHandler: true,
  })

  return response.data.data ?? []
}

export const restoreRecycleBinFileApi = async (fileId: string): Promise<void> => {
  await api.patch(`/files/${encodeURIComponent(fileId)}/restore`, null, {
    skipGlobalErrorHandler: true,
  })
}

export const permanentlyDeleteRecycleBinFileApi = async (fileId: string): Promise<void> => {
  await api.delete(`/files/${encodeURIComponent(fileId)}/permanent`, {
    skipGlobalErrorHandler: true,
  })
}

export const emptyRecycleBinApi = async (): Promise<void> => {
  await api.delete("/files/recycle-bin/empty", {
    skipGlobalErrorHandler: true,
  })
}
