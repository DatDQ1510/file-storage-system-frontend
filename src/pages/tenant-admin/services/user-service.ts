import {
  getAllUsersPage,
  postCreateTenantUser,
} from "@/pages/tenant-admin/api/user-api"
import type {
  ICreateTenantUserRequest,
  ICreateTenantUserResponse,
  IUserDirectoryPage,
} from "@/pages/tenant-admin/types"

export const createTenantUser = async (
  input: ICreateTenantUserRequest
): Promise<ICreateTenantUserResponse> => {
  return postCreateTenantUser(input)
}

export const loadUserDirectoryPage = async (input: {
  page: number
  offset: number
}): Promise<IUserDirectoryPage> => {
  return getAllUsersPage(input)
}
