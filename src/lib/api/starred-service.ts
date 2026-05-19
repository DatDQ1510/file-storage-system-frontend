import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"

export interface IStarredFileResponse {
  starId: string
  fileId: string
  fileName: string
  folderId: string
  folderPath: string
  projectId: string
  sizeFile: number
  statusFile: string | null
  starredAt: string
  fileUpdatedAt: string
}

export interface IStarredFolderResponse {
  starId: string
  folderId: string
  folderName: string
  path: string
  projectId: string
  starredAt: string
  folderUpdatedAt: string
}

export interface IStarredPageResponse {
  folders: IStarredFolderResponse[]
  files: IStarredFileResponse[]
}

export const getStarredPageApi = async (): Promise<IStarredPageResponse> => {
  const response = await api.get<IApiResponse<IStarredPageResponse>>("/starred", {
    skipGlobalErrorHandler: true,
  })

  return response.data.data ?? { folders: [], files: [] }
}

export const starFileApi = async (fileId: string): Promise<IStarredFileResponse> => {
  const response = await api.post<IApiResponse<IStarredFileResponse>>(
    `/files/${encodeURIComponent(fileId)}/star`,
    {},
    { skipGlobalErrorHandler: true }
  )

  return response.data.data
}

export const unstarFileApi = async (fileId: string): Promise<void> => {
  await api.delete(`/files/${encodeURIComponent(fileId)}/star`, {
    skipGlobalErrorHandler: true,
  })
}

export const starFolderApi = async (folderId: string): Promise<IStarredFolderResponse> => {
  const response = await api.post<IApiResponse<IStarredFolderResponse>>(
    `/folders/${encodeURIComponent(folderId)}/star`,
    {},
    { skipGlobalErrorHandler: true }
  )

  return response.data.data
}

export const unstarFolderApi = async (folderId: string): Promise<void> => {
  await api.delete(`/folders/${encodeURIComponent(folderId)}/star`, {
    skipGlobalErrorHandler: true,
  })
}