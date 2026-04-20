import {
  postAddProjectMember,
  getAllProjectsPage,
  getProjectOwnerOptions,
  postCreateProject,
} from "@/pages/tenant-admin/api/project-api"
import type {
  IAddProjectMemberRequest,
  IProjectDirectoryPage,
  IProjectMemberResponse,
  IProjectRequest,
  IProjectResponse,
  IProjectOwnerOption,
} from "@/pages/tenant-admin/types"

export const createProject = async (
  input: IProjectRequest
): Promise<IProjectResponse> => {
  return postCreateProject(input)
}

export const addProjectMember = async (input: {
  projectId: string
  request: IAddProjectMemberRequest
}): Promise<IProjectMemberResponse> => {
  return postAddProjectMember(input.projectId, input.request)
}

export const searchProjectOwners = async (input: {
  keyword: string
  page?: number
  size?: number
}): Promise<IProjectOwnerOption[]> => {
  return getProjectOwnerOptions(input)
}

export const loadProjectDirectoryPage = async (input: {
  page: number
  size: number
}): Promise<IProjectDirectoryPage> => {
  return getAllProjectsPage(input)
}
