import { api } from "@/lib/api/axios-client"
import type { IApiResponse } from "@/types/auth"

export interface IUserProjectListItemResponse {
  id?: string
  nameProject?: string
}

export interface IUserProjectDetailResponse {
  id?: string
  nameProject?: string
  ownerId?: string
  ownerName?: string
  status?: string
  department?: string
}

export interface IUserProjectDetail {
  id: string
  name: string
  ownerId: string
  ownerName: string
  status: string
  department: string
}

export interface IUserTenantListItemResponse {
  id?: string
  userName?: string
  email?: string
}

export interface IUserTenantPageResponse {
  items: IUserTenantListItemResponse[]
  page: number
  offset: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface IUserTenantOption {
  id: string
  name: string
  email: string
}

export interface IUserProjectPageResponse {
  items: IUserProjectListItemResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface IUserSidebarProjectItem {
  id: string
  name: string
}

export interface IUserSidebarProjectPage {
  items: IUserSidebarProjectItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

const toUserSidebarProjectItem = (
  item: IUserProjectListItemResponse,
  index: number,
  page: number,
  size: number
): IUserSidebarProjectItem => {
  const fallbackId = `user-project-${page}-${size}-${index}`

  return {
    id: item.id?.trim() ? item.id : fallbackId,
    name: item.nameProject?.trim() ? item.nameProject : "Untitled Project",
  }
}

export const getUserProjectsPage = async (input: {
  page: number
  size?: number
}): Promise<IUserSidebarProjectPage> => {
  const pageSize = input.size ?? 10

  const response = await api.get<IApiResponse<IUserProjectPageResponse>>(
    "/projects/my-projects",
    {
      params: {
        page: input.page,
        size: pageSize,
      },
      skipGlobalErrorHandler: true,
    }
  )

  const payload = response.data.data

  return {
    items: payload.items.map((item, index) =>
      toUserSidebarProjectItem(item, index, payload.page, payload.size)
    ),
    page: payload.page,
    size: payload.size,
    totalElements: payload.totalElements,
    totalPages: payload.totalPages,
    hasNext: payload.hasNext,
    hasPrevious: payload.hasPrevious,
  }
}

const toUserProjectDetail = (
  projectId: string,
  item: IUserProjectDetailResponse
): IUserProjectDetail => {
  return {
    id: item.id?.trim() ? item.id : projectId,
    name: item.nameProject?.trim() ? item.nameProject : "Untitled Project",
    ownerId: item.ownerId?.trim() ? item.ownerId : "",
    ownerName: item.ownerName?.trim() ? item.ownerName : "Project Owner",
    status: item.status?.trim() ? item.status : "ACTIVE",
    department: item.department?.trim() ? item.department : "General",
  }
}

const toUserTenantOption = (
  item: IUserTenantListItemResponse,
  index: number,
  page: number,
  offset: number
): IUserTenantOption => {
  const fallbackId = `tenant-user-${page}-${offset}-${index}`

  return {
    id: item.id?.trim() ? item.id : fallbackId,
    name: item.userName?.trim() ? item.userName : "Unknown User",
    email: item.email?.trim() ? item.email : "",
  }
}

export const getUserProjectDetail = async (
  projectId: string
): Promise<IUserProjectDetail> => {
  const response = await api.get<IApiResponse<IUserProjectDetailResponse>>(
    `/projects/${encodeURIComponent(projectId)}`,
    {
      skipGlobalErrorHandler: true,
    }
  )

  return toUserProjectDetail(projectId, response.data.data)
}

export const getTenantUserOptions = async (input?: {
  page?: number
  offset?: number
}): Promise<IUserTenantOption[]> => {
  const page = input?.page ?? 0
  const offset = input?.offset ?? 50

  const response = await api.get<IApiResponse<IUserTenantPageResponse>>(
    "/users",
    {
      params: {
        page,
        offset,
      },
      skipGlobalErrorHandler: true,
    }
  )

  const payload = response.data.data

  return payload.items.map((item, index) =>
    toUserTenantOption(item, index, payload.page, payload.offset)
  )
}