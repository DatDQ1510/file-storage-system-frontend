/**
 * Folder ACL permission is an integer bitmask, synchronized with UserProject:
 *   1 = READ
 *   2 = WRITE
 *   4 = DELETE
 * Combined: 3=READ+WRITE, 5=READ+DELETE, 6=WRITE+DELETE, 7=ALL
 */
export const FOLDER_PERMISSION_READ = 1
export const FOLDER_PERMISSION_WRITE = 2
export const FOLDER_PERMISSION_DELETE = 4

export interface IFolderAclItemRequest {
  userId: string
  /** Bitmask permission (1–7) */
  permission: number
}

export interface ICreateFolderWithAclRequest {
  nameFolder: string
  path?: string
  parentFolderId?: string | null
  aclEntries?: IFolderAclItemRequest[]
}

export interface IFolderResponse {
  id: string
  nameFolder: string
  path: string
  tenantId: string
  projectId: string
  ownerId: string
  parentFolderId: string | null
  createdAt: string
  updatedAt: string
}

export interface IFolderAclItemResponse {
  id: string
  userId: string
  userName: string
  /** Bitmask permission (1–7) */
  permission: number
}

export interface ICreateFolderWithAclResponse {
  folder: IFolderResponse
  aclEntries: IFolderAclItemResponse[]
}

export interface IProjectFolderItem {
  id: string
  name: string
  filesCount: number
  parentFolderId: string | null
  isVirtual?: boolean
}

/** Folder path node returned by the path browser APIs */
export interface IFolderPathNode {
  folderId: string
  nameFolder: string
  path: string
  hasChildren: boolean
}

/** A project member available for folder ACL selection */
export interface IProjectMemberForAcl {
  userId: string
  userName: string
  email: string
}

/** Upsert folder ACL request body */
export interface IUpsertFolderAclRequest {
  /** Bitmask permission (1–7) */
  permission: number
}
