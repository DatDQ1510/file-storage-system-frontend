import { useState } from "react"
import {
  initiateMultipartUpload,
  getPresignedUrlForPart,
  uploadChunkToStorage,
  completeMultipartUpload,
  type IPartDTO,
} from "@/lib/api/storage-service"

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024 // 10MB



export const useMultipartUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (
    file: File,
    options?: {
      chunkSize?: number
      bucketName?: string
      onProgress?: (progress: number) => void
    }
  ) => {
    const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE
    const bucketName = options?.bucketName
    
    setIsUploading(true)
    setOverallProgress(0)
    setError(null)

    try {
      // 1. Initiate
      const { uploadId, objectName } = await initiateMultipartUpload(
        file.name,
        bucketName
      )

      const totalChunks = Math.ceil(file.size / chunkSize)
      const parts: IPartDTO[] = []
      const chunkProgresses: Record<number, number> = {}

      // 2. Upload chunks
      for (let i = 0; i < totalChunks; i++) {
        const partNumber = i + 1
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        const chunk = file.slice(start, end)

        // Get fresh pre-signed URL for this part
        const url = await getPresignedUrlForPart({
          objectName,
          uploadId,
          partNumber,
          bucketName,
        })

        // Upload to storage
        const etag = await uploadChunkToStorage(
          url,
          chunk,
          file.type || "application/octet-stream",
          (progress) => {
            chunkProgresses[partNumber] = progress
            // Calculate overall progress
            const totalUploadedProgress = Object.values(chunkProgresses).reduce(
              (acc, curr) => acc + curr,
              0
            )
            const currentOverallProgress = Math.round(
              totalUploadedProgress / totalChunks
            )
            setOverallProgress(currentOverallProgress)
            options?.onProgress?.(currentOverallProgress)
          }
        )

        parts.push({ partNumber, etag })
      }

      // 3. Complete
      await completeMultipartUpload(
        {
          uploadId,
          objectName,
          parts,
        },
        bucketName
      )

      setIsUploading(false)
      setOverallProgress(100)
      return { objectName, uploadId }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      setError(errorMessage)
      setIsUploading(false)
      throw err
    }
  }

  return {
    uploadFile,
    isUploading,
    overallProgress,
    error,
  }
}
