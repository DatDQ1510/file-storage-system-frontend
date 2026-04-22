import {
  createFolderWithAclApi,
  getProjectFoldersApi,
  getChildFolderPathsApi,
  searchFolderPathsApi,
  getProjectMembersForAclApi,
} from "@/pages/user/projects/api/folder-api"
import type {
  ICreateFolderWithAclRequest,
  ICreateFolderWithAclResponse,
  IFolderPathNode,
  IProjectFolderItem,
  IProjectMemberForAcl,
} from "@/pages/user/projects/types/folder"

const toProjectFolderItem = (input: {
  id?: string
  nameFolder?: string
  parentFolderId?: string | null
  fallbackIndex: number
}): IProjectFolderItem => {
  return {
    id: input.id?.trim() ? input.id : `folder-${input.fallbackIndex}`,
    name: input.nameFolder?.trim()
      ? input.nameFolder
      : `Folder ${input.fallbackIndex}`,
    filesCount: 0,
    parentFolderId: input.parentFolderId ?? null,
  }
}

export const getProjectFolders = async (
  projectId: string
): Promise<IProjectFolderItem[]> => {
  const folders = await getProjectFoldersApi(projectId)
  return folders.map((folder, index) =>
    toProjectFolderItem({
      id: folder.id,
      nameFolder: folder.nameFolder,
      parentFolderId: folder.parentFolderId,
      fallbackIndex: index + 1,
    })
  )
  // No virtual folders – return empty array if API returns nothing
}

export const createProjectFolderWithAcl = async (input: {
  projectId: string
  request: ICreateFolderWithAclRequest
}): Promise<ICreateFolderWithAclResponse> => {
  return createFolderWithAclApi(input)
}

export const getChildFolderPaths = async (
  projectId: string,
  parentPath: string = "/"
): Promise<IFolderPathNode[]> => {
  return getChildFolderPathsApi(projectId, parentPath)
}

export const searchFolderPaths = async (
  projectId: string,
  keyword: string
): Promise<IFolderPathNode[]> => {
  if (!keyword.trim()) return []
  return searchFolderPathsApi(projectId, keyword)
}

export const getProjectMembersForAcl = async (
  projectId: string
): Promise<IProjectMemberForAcl[]> => {
  return getProjectMembersForAclApi(projectId)
}
