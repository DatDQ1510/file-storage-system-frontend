import { useState, useCallback } from "react"
import pLimit from "p-limit"
import { preSignBatch, finalizeFileUpload, uploadChunkToStorage } from "@/lib/api/chunk-upload-service"
import type { IChunkPreSignItemRequest, IFileUploadFinalizeResponse } from "@/types/chunk"

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024 // 5MB
const BATCH_SIZE = 10
const CONCURRENCY_LIMIT = 3

interface IUploadOptions {
  tenantId: string
  folderId: string
  ownerId: string
  chunkSize?: number
  concurrency?: number
  batchSize?: number
  onProgress?: (progress: number) => void
}

interface IChunkData {
  index: number
  blob: Blob
  hash?: string
  status?: "PENDING" | "EXISTS" | "NEED_UPLOAD"
  uploadUrl?: string
  uploaded?: boolean
}

export const useChunkedUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [statusText, setStatusText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (
    file: File,
    options: IUploadOptions
  ): Promise<IFileUploadFinalizeResponse | null> => {
    const {
      tenantId,
      folderId,
      ownerId,
      chunkSize = DEFAULT_CHUNK_SIZE,
      concurrency = CONCURRENCY_LIMIT,
      batchSize = BATCH_SIZE,
      onProgress
    } = options

    setIsUploading(true)
    setOverallProgress(0)
    setStatusText("Preparing file...")
    setError(null)

    try {
      const totalChunks = Math.ceil(file.size / chunkSize)
      const chunksData: IChunkData[] = []

      // 1. Slice file into chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        chunksData.push({
          index: i,
          blob: file.slice(start, end)
        })
      }

      setStatusText("Calculating hashes...")

      // 2. Hash chunks using Web Worker
      await new Promise<void>((resolve, reject) => {
        let hashedCount = 0
        const worker = new Worker(new URL("../workers/hash-worker.ts", import.meta.url), { type: "module" })
        
        worker.onmessage = (e) => {
          if (e.data.error) {
            worker.terminate()
            reject(new Error(e.data.error))
            return
          }
          
          const { hash, index } = e.data
          chunksData[index].hash = hash
          hashedCount++
          
          const progress = Math.round((hashedCount / totalChunks) * 20) // hashing is 20% of progress
          setOverallProgress(progress)
          onProgress?.(progress)
          
          if (hashedCount === totalChunks) {
            worker.terminate()
            resolve()
          }
        }

        worker.onerror = (err) => {
          worker.terminate()
          reject(err)
        }

        chunksData.forEach((chunk) => {
          worker.postMessage({ chunk: chunk.blob, index: chunk.index })
        })
      })

      setStatusText("Checking pre-signed URLs...")

      // 3. Batch Pre-check
      const chunkHashesList: string[] = []
      
      for (let i = 0; i < chunksData.length; i += batchSize) {
        const batch = chunksData.slice(i, i + batchSize)
        const batchRequestItems: IChunkPreSignItemRequest[] = batch.map(c => ({
          hash: c.hash!,
          size: c.blob.size
        }))

        const batchResponse = await preSignBatch({
          tenantId,
          chunks: batchRequestItems,
        })

        // Map response back to chunksData
        batchResponse.items.forEach(itemRes => {
          const chunkMatch = chunksData.find(c => c.hash === itemRes.hash)
          if (chunkMatch) {
            chunkMatch.status = itemRes.status as "PENDING" | "EXISTS" | "NEED_UPLOAD"
            chunkMatch.uploadUrl = itemRes.uploadUrl
            chunkHashesList[chunkMatch.index] = itemRes.hash
            
            if (itemRes.status === "EXISTS") {
              chunkMatch.uploaded = true
            }
          }
        })
      }

      setStatusText("Uploading chunks...")

      // 4. Concurrent Upload
      const limit = pLimit(concurrency)
      const chunksToUpload = chunksData.filter(c => c.status === "NEED_UPLOAD" && !c.uploaded && c.uploadUrl)
      let completedUploads = chunksData.length - chunksToUpload.length
      
      const updateUploadProgress = () => {
         // Upload is 80% of the progress
         const uploadProgress = Math.round((completedUploads / totalChunks) * 80)
         const totalProgress = 20 + uploadProgress
         setOverallProgress(totalProgress)
         onProgress?.(totalProgress)
      }
      
      updateUploadProgress()

      const uploadPromises = chunksToUpload.map(chunk => 
        limit(async () => {
          await uploadChunkToStorage(
            chunk.uploadUrl!,
            chunk.blob,
            file.type || "application/octet-stream"
          )
          chunk.uploaded = true
          completedUploads++
          updateUploadProgress()
        })
      )

      await Promise.all(uploadPromises)

      setStatusText("Finalizing upload...")

      // 5. Finalize
      const finalResponse = await finalizeFileUpload({
        tenantId,
        folderId,
        ownerId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        totalSize: file.size,
        chunkHashes: chunkHashesList
      })

      setStatusText("Upload complete")
      setIsUploading(false)
      setOverallProgress(100)
      onProgress?.(100)
      
      return finalResponse

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      setError(errorMessage)
      setIsUploading(false)
      setStatusText("Error")
      throw err
    }
  }, [])

  return {
    uploadFile,
    isUploading,
    overallProgress,
    statusText,
    error
  }
}
