import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"

/**
 * Request body for renaming a file
 */
export interface IRenameFileRequest {
  nameFile: string
}

/**
 * Rename file - PATCH /api/v1/files/{fileId}
 * Requires WRITE permission on file
 */
export const renameFileApi = async (
  fileId: string,
  nameFile: string
): Promise<void> => {
  await api.patch(
    `/files/${encodeURIComponent(fileId)}`,
    { nameFile } as IRenameFileRequest,
    { skipGlobalErrorHandler: true }
  )
}

/**
 * Delete file (soft delete) - DELETE /api/v1/files/{fileId}
 * Marks file with deletedAt timestamp (moves to recycle bin)
 * Requires DELETE permission on file
 */
export const deleteFileApi = async (fileId: string): Promise<void> => {
  await api.delete(`/files/${encodeURIComponent(fileId)}`, {
    skipGlobalErrorHandler: true,
  })
}

/**
 * Move file to different folder - PUT /api/v1/files/{fileId}
 * This uses the full UpdateFileRequest, so it requires all fields.
 * Consider using renameFileApi for rename-only operations.
 */
export const moveFileToFolderApi = async (
  fileId: string,
  newFolderId: string
): Promise<void> => {
  // TODO: Implement once UpdateFileRequest structure is confirmed
  // This is a placeholder for future enhancement
  console.warn("moveFileToFolderApi not yet implemented")
}

/**
 * Get file details including name for renaming verification
 */
export const getFileDetailsApi = async (
  fileId: string
): Promise<{ id: string; nameFile: string }> => {
  const response = await api.get<
    IApiResponse<{ id: string; nameFile: string }>
  >(`/files/${encodeURIComponent(fileId)}`, {
    skipGlobalErrorHandler: true,
  })
  return response.data.data
}
