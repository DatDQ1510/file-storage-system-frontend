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

// ─── Project-scoped folder APIs (/api/v1/projects/{projectId}/folders/*) ───────

/**
 * GET /api/v1/projects/{projectId}/folders
 * Lấy tất cả folders của project (flat list).
 */
export const getProjectFoldersApi = async (
  projectId: string
): Promise<IFolderResponse[]> => {
  const response = await api.get<IApiResponse<IFolderResponse[]>>(
    `/projects/${encodeURIComponent(projectId)}/folders`,
    { skipGlobalErrorHandler: true }
  )
  return response.data.data ?? []
}

/**
 * POST /api/v1/projects/{projectId}/folders
 * Tạo folder mới trong project, kèm ACL tuỳ chọn.
 * parentFolderId trong request body xác định folder cha (null = root).
 */
export const createFolderWithAclApi = async (input: {
  projectId: string
  request: ICreateFolderWithAclRequest
}): Promise<ICreateFolderWithAclResponse> => {
  const response = await api.post<IApiResponse<ICreateFolderWithAclResponse>>(
    `/projects/${encodeURIComponent(input.projectId)}/folders`,
    input.request,
    { skipGlobalErrorHandler: true }
  )
  return response.data.data
}

/**
 * GET /api/v1/projects/{projectId}/folders/children?parentPath=
 * Lấy các folder con trực tiếp theo path cha (path-based tree browser).
 * parentPath mặc định là "/" (root).
 */
export const getChildFolderPathsApi = async (
  projectId: string,
  parentPath: string = "/"
): Promise<IFolderPathNode[]> => {
  const response = await api.get<IApiResponse<IFolderPathNode[]>>(
    `/projects/${encodeURIComponent(projectId)}/folders/children`,
    {
      params: { parentPath },
      skipGlobalErrorHandler: true,
    }
  )
  return response.data.data ?? []
}

/**
 * GET /api/v1/projects/{projectId}/folders/search?keyword=
 * Tìm kiếm folder theo tên/path trong project.
 */
export const searchFolderPathsApi = async (
  projectId: string,
  keyword: string
): Promise<IFolderPathNode[]> => {
  const response = await api.get<IApiResponse<IFolderPathNode[]>>(
    `/projects/${encodeURIComponent(projectId)}/folders/search`,
    {
      params: { keyword },
      skipGlobalErrorHandler: true,
    }
  )
  return response.data.data ?? []
}

/**
 * GET /api/v1/projects/{projectId}/members-for-acl
 * Lấy danh sách members của project để dùng khi gán ACL cho folder.
 */
export const getProjectMembersForAclApi = async (
  projectId: string
): Promise<IProjectMemberForAcl[]> => {
  const response = await api.get<IApiResponse<IProjectMemberForAcl[]>>(
    `/projects/${encodeURIComponent(projectId)}/members-for-acl`,
    { skipGlobalErrorHandler: true }
  )
  return response.data.data ?? []
}

// ─── Folder-specific APIs (/api/v1/folders/{folderId}/*) ─────────────────────

/**
 * GET /api/v1/folders/{folderId}
 * Lấy thông tin chi tiết của một folder (path, name, parentId, ...).
 */
export const getFolderByIdApi = async (folderId: string): Promise<IFolderResponse> => {
  const response = await api.get<IApiResponse<IFolderResponse>>(
    `/folders/${encodeURIComponent(folderId)}`,
    { skipGlobalErrorHandler: true }
  )
  return response.data.data
}

/**
 * GET /api/v1/folders/{folderId}/children?projectId=
 * Lấy danh sách folder con trực tiếp theo parentId (id-based tree traversal).
 */
export const getChildFoldersByParentIdApi = async (
  folderId: string,
  projectId: string
): Promise<IFolderResponse[]> => {
  const response = await api.get<IApiResponse<IFolderResponse[]>>(
    `/folders/${encodeURIComponent(folderId)}/children`,
    {
      params: { projectId },
      skipGlobalErrorHandler: true,
    }
  )
  return response.data.data ?? []
}

/**
 * PATCH /api/v1/folders/{folderId}
 * Đổi tên folder (yêu cầu quyền WRITE – bit 2).
 */
export const renameFolderApi = async (
  folderId: string,
  nameFolder: string
): Promise<IFolderResponse> => {
  const response = await api.patch<IApiResponse<IFolderResponse>>(
    `/folders/${encodeURIComponent(folderId)}`,
    { nameFolder },
    { skipGlobalErrorHandler: true }
  )
  return response.data.data
}

/**
 * DELETE /api/v1/folders/{folderId}
 * Xóa folder (yêu cầu quyền DELETE – bit 4).
 */
export const deleteFolderByActorApi = async (folderId: string): Promise<void> => {
  await api.delete(`/folders/${encodeURIComponent(folderId)}`, {
    skipGlobalErrorHandler: true,
  })
}

// ─── Folder ACL APIs ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/folders/{folderId}/acl
 * Xem tất cả ACL entries của một folder.
 */
export const getFolderAclApi = async (
  folderId: string
): Promise<IFolderAclItemResponse[]> => {
  const response = await api.get<IApiResponse<IFolderAclItemResponse[]>>(
    `/folders/${encodeURIComponent(folderId)}/acl`,
    { skipGlobalErrorHandler: true }
  )
  return response.data.data ?? []
}

/**
 * PUT /api/v1/folders/{folderId}/acl/{userId}
 * Upsert (tạo hoặc cập nhật) permission của một user trên folder.
 */
export const upsertFolderAclApi = async (
  folderId: string,
  userId: string,
  request: IUpsertFolderAclRequest
): Promise<IFolderAclItemResponse> => {
  const response = await api.put<IApiResponse<IFolderAclItemResponse>>(
    `/folders/${encodeURIComponent(folderId)}/acl/${encodeURIComponent(userId)}`,
    request,
    { skipGlobalErrorHandler: true }
  )
  return response.data.data
}
