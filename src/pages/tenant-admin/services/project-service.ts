import {
  getProjectOwnerOptions,
  postCreateProject,
} from "@/pages/tenant-admin/api/project-api"
import type {
  IProjectRequest,
  IProjectResponse,
  IProjectOwnerOption,
} from "@/pages/tenant-admin/types"

export const createProject = async (
  input: IProjectRequest
): Promise<IProjectResponse> => {
  return postCreateProject(input)
}

export const searchProjectOwners = async (input: {
  keyword: string
  page?: number
  size?: number
}): Promise<IProjectOwnerOption[]> => {
  return getProjectOwnerOptions(input)
}
