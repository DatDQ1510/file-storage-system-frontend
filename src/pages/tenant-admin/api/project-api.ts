import { api } from "@/lib/api/axios-client"
import type {
  IProjectOwnerOption,
  IProjectRequest,
  IProjectResponse,
  IUserSearchPageResponse,
} from "@/pages/tenant-admin/types"
import type { IApiResponse } from "@/types/auth"

export const postCreateProject = async (
  input: IProjectRequest
): Promise<IProjectResponse> => {
  const response = await api.post<IApiResponse<IProjectResponse>>(
    "/projects",
    input,
    {
      skipGlobalErrorHandler: true,
    }
  )

  return response.data.data
}

export const getProjectOwnerOptions = async (input: {
  keyword: string
  page?: number
  size?: number
}): Promise<IProjectOwnerOption[]> => {
  const response = await api.get<IApiResponse<IUserSearchPageResponse>>(
    "/users/search",
    {
      params: {
        keyword: input.keyword,
        page: input.page ?? 0,
        size: input.size ?? 10,
      },
      skipGlobalErrorHandler: true,
    }
  )

  return response.data.data.items.map((item) => ({
    id: item.id,
    name: item.userName,
    email: item.email,
  }))
}
