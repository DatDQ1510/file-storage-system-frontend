import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"
import type {
  IChunkPreSignBatchRequest,
  IChunkPreSignBatchResponse,
  IFileUploadFinalizeRequest,
  IFileUploadFinalizeResponse,
} from "@/types/chunk"
import axios from "axios"

/**
 * Pre-sign a batch of chunks to check for existence and get upload URLs
 */
export const preSignBatch = async (
  request: IChunkPreSignBatchRequest
): Promise<IChunkPreSignBatchResponse> => {
  const response = await api.post<IApiResponse<IChunkPreSignBatchResponse>>(
    "/chunks/pre-sign-batch",
    request
  )
  return response.data.data
}

/**
 * Finalize file upload after all chunks are uploaded
 */
export const finalizeFileUpload = async (
  request: IFileUploadFinalizeRequest
): Promise<IFileUploadFinalizeResponse> => {
  const response = await api.post<IApiResponse<IFileUploadFinalizeResponse>>(
    "/chunks/finalize-file-upload",
    request
  )
  return response.data.data
}

/**
 * Upload a single chunk directly to the pre-signed URL
 */
export const uploadChunkToStorage = async (
  url: string,
  chunk: Blob,
  contentType: string = "application/octet-stream",
  onProgress?: (progress: number) => void
): Promise<void> => {
  await axios.put(url, chunk, {
    headers: {
      "Content-Type": contentType,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    },
  })
}
