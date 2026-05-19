import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"

export type TFileStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DELETED"

export interface IFileResponse {
  id: string
  nameFile: string
  statusFile: TFileStatus
  sizeFile: number
  extraInfo: unknown
  tenantId: string
  folderId: string
  ownerId: string
  lockedByUserId: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface ICreateFileRequest {
  nameFile: string
  statusFile: TFileStatus
  sizeFile: number
  extraInfo?: unknown
  tenantId: string
  folderId: string
  ownerId: string
  lockedByUserId?: string | null
}

export const getAllFilesApi = async (): Promise<IFileResponse[]> => {
  const response = await api.get<IApiResponse<IFileResponse[]>>("/files", {
    skipGlobalErrorHandler: true,
  })

  return (response.data.data ?? []).filter((file) => !file.deletedAt)
}

export const getFilesByFolderApi = async (folderId: string): Promise<IFileResponse[]> => {
  const response = await api.get<IApiResponse<IFileResponse[]>>("/files", {
    params: { folderId },
    skipGlobalErrorHandler: true,
  })

  return (response.data.data ?? []).filter((file) => !file.deletedAt)
}

export const getFileByIdApi = async (fileId: string): Promise<IFileResponse> => {
  const response = await api.get<IApiResponse<IFileResponse>>(`/files/${fileId}`, {
    skipGlobalErrorHandler: true,
  })
  return response.data.data
}

export const createFileApi = async (request: ICreateFileRequest): Promise<IFileResponse> => {
  const response = await api.post<IApiResponse<IFileResponse>>("/files", request, {
    skipGlobalErrorHandler: true,
  })

  return response.data.data
}

// ========== File Share Endpoints ==========

export type TFileSharePermission = "VIEW" | "COMMENT" | "EDIT"

export interface IFileShareResponse {
  id: string
  fileId: string
  sharedWithUserId: string
  sharedByUserId: string
  permission: TFileSharePermission
  expiresAt: string | null
  createdAt: string
}

export interface IShareFileRequest {
  sharedWithUserId: string
  permission: TFileSharePermission
  expiresAt?: string | null
}

export const shareFileApi = async (fileId: string, request: IShareFileRequest): Promise<IFileShareResponse> => {
  const response = await api.post<IApiResponse<IFileShareResponse>>(`/files/${fileId}/share`, request, {
    skipGlobalErrorHandler: false,
  })
  return response.data.data
}

export const getFileSharesApi = async (fileId: string): Promise<IFileShareResponse[]> => {
  const response = await api.get<IApiResponse<IFileShareResponse[]>>(`/files/${fileId}/shares`, {
    skipGlobalErrorHandler: true,
  })
  return response.data.data ?? []
}

export const updateFileShareApi = async (fileId: string, sharedWithUserId: string, request: IShareFileRequest): Promise<IFileShareResponse> => {
  const response = await api.put<IApiResponse<IFileShareResponse>>(`/files/${fileId}/share/${sharedWithUserId}`, request, {
    skipGlobalErrorHandler: false,
  })
  return response.data.data
}

export const unshareFileApi = async (fileId: string, sharedWithUserId: string): Promise<void> => {
  await api.delete(`/files/${fileId}/share/${sharedWithUserId}`, {
    skipGlobalErrorHandler: false,
  })
}
