import { api } from "@/lib/api/axios-client"
import type {
  IAddProjectMemberRequest,
  IProjectDirectoryPage,
  IProjectListItemResponse,
  IProjectMemberResponse,
  IProjectOwnerOption,
  IProjectPageResponse,
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

export const postAddProjectMember = async (
  projectId: string,
  input: IAddProjectMemberRequest
): Promise<IProjectMemberResponse> => {
  const response = await api.post<IApiResponse<IProjectMemberResponse>>(
    `/projects/${encodeURIComponent(projectId)}/members/assign`,
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
  signal?: AbortSignal
}): Promise<IProjectOwnerOption[]> => {
  const response = await api.get<IApiResponse<IUserSearchPageResponse>>(
    "/users/search",
    {
      params: {
        keyword: input.keyword,
        page: input.page ?? 0,
        size: input.size ?? 10,
      },
      signal: input.signal,
      skipGlobalErrorHandler: true,
    }
  )

  return response.data.data.items.map((item) => ({
    id: item.id,
    name: item.userName,
    email: item.email,
  }))
}

const mapProjectStatus = (status?: string): "Active" | "Planning" | "Archived" => {
  const normalizedStatus = status?.trim().toUpperCase() ?? ""

  if (normalizedStatus.includes("ARCH")) {
    return "Archived"
  }

  if (normalizedStatus.includes("PLAN") || normalizedStatus.includes("PENDING")) {
    return "Planning"
  }

  return "Active"
}

const toStorageLabel = (storageValue: number | string | null | undefined): string => {
  if (storageValue === null || storageValue === undefined) {
    return "0GB"
  }

  if (typeof storageValue === "number") {
    return `${storageValue}GB`
  }

  const normalizedStorage = storageValue.trim()
  if (!normalizedStorage) {
    return "0GB"
  }

  return normalizedStorage
}

const toStoragePercent = (used: number | string | null | undefined, total: number | string | null | undefined): number => {
  const numericUsed = Number(used)
  const numericTotal = Number(total)

  if (!Number.isFinite(numericUsed) || !Number.isFinite(numericTotal) || numericTotal <= 0) {
    return 0
  }

  return Math.max(0, Math.min(Math.round((numericUsed / numericTotal) * 100), 100))
}

const mapProjectItemToRecord = (
  item: IProjectListItemResponse,
  index: number,
  page: number,
  size: number
) => {
  const serial = page * size + index + 1

  return {
    id: item.id?.trim() ? item.id : `proj-${String(serial).padStart(3, "0")}`,
    name: item.nameProject?.trim() ? item.nameProject : "Untitled Project",
    ownerId: item.ownerId?.trim() ? item.ownerId : "",
    department: item.department?.trim() ? item.department : "General",
    pm: item.ownerName?.trim() ? item.ownerName : "Project Owner",
    membersCount:
      typeof item.membersCount === "number" && Number.isFinite(item.membersCount)
        ? Math.max(0, Math.floor(item.membersCount))
        : 0,
    storageUsed: toStorageLabel(item.storageUsed),
    storageTotal: toStorageLabel(item.storageTotal ?? 100),
    storagePercent: toStoragePercent(item.storageUsed, item.storageTotal ?? 100),
    status: mapProjectStatus(item.status),
    icon: "folder",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  }
}

export const getAllProjectsPage = async (input: {
  page: number
  size: number
}): Promise<IProjectDirectoryPage> => {
  const response = await api.get<IApiResponse<IProjectPageResponse>>("/projects", {
    params: {
      page: input.page,
      size: input.size,
    },
    skipGlobalErrorHandler: true,
  })

  const payload = response.data.data

  return {
    items: payload.items.map((item, index) =>
      mapProjectItemToRecord(item, index, payload.page, payload.size)
    ),
    page: payload.page,
    size: payload.size,
    totalElements: payload.totalElements,
    totalPages: payload.totalPages,
    hasNext: payload.hasNext,
    hasPrevious: payload.hasPrevious,
  }
}
