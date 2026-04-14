import { api } from "@/lib/api/axios-client"
import type {
  IAllUserPageResponse,
  ICreateTenantUserRequest,
  ICreateTenantUserResponse,
  IUserDirectoryPage,
  IUserDirectoryRecord,
  TTenantUserStatus,
} from "@/pages/tenant-admin/types"
import type { IApiResponse } from "@/types/auth"

interface IGetAllUsersInput {
  page: number
  offset: number
}

export const postCreateTenantUser = async (
  input: ICreateTenantUserRequest
): Promise<ICreateTenantUserResponse> => {
  const response = await api.post<IApiResponse<ICreateTenantUserResponse>>(
    "/users",
    input,
    {
      skipGlobalErrorHandler: true,
    }
  )

  return response.data.data
}

const toTenantUserStatus = (status: string): TTenantUserStatus => {
  const normalizedStatus = status.trim().toUpperCase()

  if (normalizedStatus.includes("SUSPEND") || normalizedStatus.includes("INACTIVE") || normalizedStatus.includes("DISABLE")) {
    return "Suspended"
  }

  if (normalizedStatus.includes("PENDING")) {
    return "Pending"
  }

  return "Active"
}

const toStorageLabel = (storage: string | number | null): string => {
  if (storage === null || storage === undefined) {
    return "0 GB"
  }

  if (typeof storage === "number") {
    return `${storage.toLocaleString("en-US")} GB`
  }

  const parsedStorage = Number(storage)
  if (Number.isFinite(parsedStorage)) {
    return `${parsedStorage.toLocaleString("en-US")} GB`
  }

  return `${storage}`
}

const toJoinedDateLabel = (createdAt?: string): string => {
  if (!createdAt) {
    return "-"
  }

  const dateValue = new Date(createdAt)
  if (Number.isNaN(dateValue.getTime())) {
    return "-"
  }

  return dateValue.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

const mapAllUserToUserDirectoryRecord = (
  user: IAllUserPageResponse["items"][number],
  index: number,
  page: number,
  offset: number
): IUserDirectoryRecord => {
  const serial = page * offset + index + 1

  return {
    id: `usr-${String(serial).padStart(3, "0")}`,
    fullName: user.userName,
    email: user.email,
    phone: user.phoneNumber || "N/A",
    employeeCode: `EMP-${1000 + serial}`,
    department: user.department || "General",
    status: toTenantUserStatus(user.status),
    joinedAt: toJoinedDateLabel(user.createdAt),
    mfaEnabled: Boolean(user.MFAEnabled),
    storageUsed: toStorageLabel(user.storage),
  }
}

export const getAllUsersPage = async ({
  page,
  offset,
}: IGetAllUsersInput): Promise<IUserDirectoryPage> => {
  const response = await api.get<IApiResponse<IAllUserPageResponse>>("/users", {
    params: {
      page,
      offset,
    },
    skipGlobalErrorHandler: true,
  })

  const payload = response.data.data
  return {
    items: payload.items.map((item, index) =>
      mapAllUserToUserDirectoryRecord(item, index, payload.page, payload.offset)
    ),
    page: payload.page,
    offset: payload.offset,
    totalElements: payload.totalElements,
    totalPages: payload.totalPages,
    hasNext: payload.hasNext,
    hasPrevious: payload.hasPrevious,
    isMockData: false,
  }
}
