import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"
import type {
  ICreateFolderWithAclRequest,
  ICreateFolderWithAclResponse,
  IFolderAclItemResponse,
  IFolderPathNode,
  IFolderResponse,
  IProjectMemberForAcl,
  IUpsertFolderAclRequest,
} from "@/pages/user/projects/types/folder"

export const getProjectFoldersApi = async (
  projectId: string
): Promise<IFolderResponse[]> => {
  const response = await api.get<IApiResponse<IFolderResponse[]>>(
    `/folders/project/${encodeURIComponent(projectId)}`,
    {
      skipGlobalErrorHandler: true,
    }
  )

  return response.data.data ?? []
}

/** GET /api/v1/folders/{folderId} – lấy thông tin một folder (path, name, ...) */
export const getFolderByIdApi = async (folderId: string): Promise<IFolderResponse> => {
  const response = await api.get<IApiResponse<IFolderResponse>>(
    `/folders/${encodeURIComponent(folderId)}`,
    { skipGlobalErrorHandler: true }
  )
  return response.data.data
}

export const createFolderWithAclApi = async (input: {
  projectId: string
  request: ICreateFolderWithAclRequest
}): Promise<ICreateFolderWithAclResponse> => {
  const response = await api.post<IApiResponse<ICreateFolderWithAclResponse>>(
    `/folders/project/${encodeURIComponent(input.projectId)}/with-acl`,
    input.request,
    {
      skipGlobalErrorHandler: true,
    }
  )

  return response.data.data
}

/** GET /api/v1/folders/project/{projectId}/paths/children?parentPath=... */
export const getChildFolderPathsApi = async (
  projectId: string,
  parentPath: string = "/"
): Promise<IFolderPathNode[]> => {
  const response = await api.get<IApiResponse<IFolderPathNode[]>>(
    `/folders/project/${encodeURIComponent(projectId)}/paths/children`,
    {
      params: { parentPath },
      skipGlobalErrorHandler: true,
    }
  )
  return response.data.data ?? []
}

/** GET /api/v1/folders/project/{projectId}/paths/search?keyword=... */
export const searchFolderPathsApi = async (
  projectId: string,
  keyword: string
): Promise<IFolderPathNode[]> => {
  const response = await api.get<IApiResponse<IFolderPathNode[]>>(
    `/folders/project/${encodeURIComponent(projectId)}/paths/search`,
    {
      params: { keyword },
      skipGlobalErrorHandler: true,
    }
  )
  return response.data.data ?? []
}

/** GET /api/v1/folders/project/{projectId}/members-for-acl */
export const getProjectMembersForAclApi = async (
  projectId: string
): Promise<IProjectMemberForAcl[]> => {
  const response = await api.get<IApiResponse<IProjectMemberForAcl[]>>(
    `/folders/project/${encodeURIComponent(projectId)}/members-for-acl`,
    {
      skipGlobalErrorHandler: true,
    }
  )
  return response.data.data ?? []
}

/** GET /api/v1/folders/{folderId}/acl */
export const getFolderAclApi = async (
  folderId: string
): Promise<IFolderAclItemResponse[]> => {
  const response = await api.get<IApiResponse<IFolderAclItemResponse[]>>(
    `/folders/${encodeURIComponent(folderId)}/acl`,
    {
      skipGlobalErrorHandler: true,
    }
  )
  return response.data.data ?? []
}

/** PUT /api/v1/folders/{folderId}/acl/{userId} */
export const upsertFolderAclApi = async (
  folderId: string,
  userId: string,
  request: IUpsertFolderAclRequest
): Promise<IFolderAclItemResponse> => {
  const response = await api.put<IApiResponse<IFolderAclItemResponse>>(
    `/folders/${encodeURIComponent(folderId)}/acl/${encodeURIComponent(userId)}`,
    request,
    {
      skipGlobalErrorHandler: true,
    }
  )
  return response.data.data
}

/** PATCH /api/v1/folders/{folderId}/rename – cần quyền WRITE (bit 2) */
export const renameFolderApi = async (
  folderId: string,
  nameFolder: string
): Promise<IFolderResponse> => {
  const response = await api.patch<IApiResponse<IFolderResponse>>(
    `/folders/${encodeURIComponent(folderId)}/rename`,
    { nameFolder },
    { skipGlobalErrorHandler: true }
  )
  return response.data.data
}

/** DELETE /api/v1/folders/{folderId}/actor – cần quyền DELETE (bit 4) */
export const deleteFolderByActorApi = async (folderId: string): Promise<void> => {
  await api.delete(`/folders/${encodeURIComponent(folderId)}/actor`, {
    skipGlobalErrorHandler: true,
  })
}
