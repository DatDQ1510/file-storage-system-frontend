export interface IChunkPreSignItemRequest {
  hash: string
  size: number
}

export interface IChunkPreSignBatchRequest {
  tenantId: string
  chunks: IChunkPreSignItemRequest[]
  expiryMinutes?: number
}

export interface IChunkPreSignItemResponse {
  hash: string
  size: number
  status: "EXISTS" | "NEED_UPLOAD"
  bucket: string
  objectName: string
  uploadUrl?: string
  existingObjectUrl?: string
  expiresAt?: string
}

export interface IChunkPreSignBatchResponse {
  items: IChunkPreSignItemResponse[]
}

export interface IFileUploadFinalizeRequest {
  tenantId: string
  folderId: string
  ownerId: string
  fileName: string
  contentType?: string
  totalSize: number
  chunkHashes: string[]
}

export interface IFileUploadFinalizeResponse {
  status: string
  messageId: string
  exchange: string
  routingKey: string
  totalChunks: number
  fileId?: string
  url?: string
  tenantId?: string
  bucket?: string
  objectName?: string
  size?: number
  contentType?: string
}
