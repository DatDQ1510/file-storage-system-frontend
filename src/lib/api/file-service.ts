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

export const createFileApi = async (request: ICreateFileRequest): Promise<IFileResponse> => {
  const response = await api.post<IApiResponse<IFileResponse>>("/files", request, {
    skipGlobalErrorHandler: true,
  })

  return response.data.data
}