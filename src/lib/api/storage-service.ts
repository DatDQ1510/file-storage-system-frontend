import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"
import axios from "axios"

export interface IInitiateMultipartResponse {
  uploadId: string
  objectName: string
}

export interface IPartDTO {
  partNumber: number
  etag: string
}

export interface ICompleteMultipartRequest {
  uploadId: string
  objectName: string
  parts: IPartDTO[]
}

/**
 * Get pre-signed URL to view/download an object
 */
export const getPresignedUrl = async (
  objectName: string,
  bucketName?: string,
  expiry?: number
): Promise<string> => {
  const response = await api.get<IApiResponse<string>>("/storage/presigned-url", {
    params: { objectName, bucketName, expiry },
  })
  return response.data.data
}

/**
 * Initiate multipart upload
 */
export const initiateMultipartUpload = async (
  objectName: string,
  bucketName?: string
): Promise<IInitiateMultipartResponse> => {
  const response = await api.post<IApiResponse<IInitiateMultipartResponse>>(
    "/storage/multipart/initiate",
    null,
    {
      params: { objectName, bucketName },
    }
  )
  return response.data.data
}

/**
 * Get pre-signed URL for a specific part
 */
export const getPresignedUrlForPart = async (input: {
  objectName: string
  uploadId: string
  partNumber: number
  bucketName?: string
  expiry?: number
}): Promise<string> => {
  const response = await api.get<IApiResponse<string>>(
    "/storage/multipart/presigned-url",
    {
      params: input,
    }
  )
  return response.data.data
}

/**
 * Complete multipart upload
 */
export const completeMultipartUpload = async (
  request: ICompleteMultipartRequest,
  bucketName?: string
): Promise<void> => {
  await api.post<IApiResponse<string>>(
    "/storage/multipart/complete",
    request,
    {
      params: { bucketName },
    }
  )
}

/**
 * Upload a single chunk directly to the pre-signed URL
 */
export const uploadChunkToStorage = async (
  url: string,
  chunk: Blob,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const response = await axios.put(url, chunk, {
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

  // ETag is returned in headers
  const etag = response.headers["etag"] ?? response.headers["x-amz-etag"]
  if (!etag) {
    throw new Error("No ETag returned from storage")
  }

  // Remove quotes from ETag if present
  return etag.replace(/"/g, "")
}
