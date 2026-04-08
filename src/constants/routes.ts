import type { TUserRole } from "@/types/auth"

export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  TOTP_SIGN_IN: "/sign-in/totp",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  SETUP_PASSWORD: "/setup-password",
  FORBIDDEN: "/403",
  DASHBOARD: "/dashboard",
  SYSTEM_ADMIN_DASHBOARD: "/dashboard/system-admin",
  SYSTEM_ADMIN_CREATE_PLAN: "/dashboard/system-admin/billing/create-plan",
  TENANT_ADMIN_DASHBOARD: "/dashboard/tenant-admin",
  USER_DASHBOARD: "/dashboard/user",
  RECENT: "/recent",
  STARRED: "/starred",
  PROJECTS: "/projects",
  PROJECT_DETAIL: "/projects/:projectId",
  PROJECT_FOLDER_DETAIL: "/projects/:projectId/folders/:folderId",
  PROJECT_FILE_DETAIL: "/projects/:projectId/files/:fileId",
  RECYCLE_BIN: "/recycle-bin",
  SUPPORT: "/support",
} as const

export type RouteKey = keyof typeof ROUTES;

export const ROLE_DASHBOARD_ROUTES: Record<TUserRole, string> = {
  SYSTEM_ADMIN: ROUTES.SYSTEM_ADMIN_DASHBOARD,
  TENANT_ADMIN: ROUTES.TENANT_ADMIN_DASHBOARD,
  USER: ROUTES.USER_DASHBOARD,
}

export const getDashboardRouteForRole = (role?: TUserRole | null) => {
  if (!role) {
    return ROUTES.SIGN_IN
  }

  return ROLE_DASHBOARD_ROUTES[role]
}

export const normalizeDashboardRoute = (
  redirectUrl?: string | null,
  role?: TUserRole | null
) => {
  if (
    redirectUrl === ROUTES.SYSTEM_ADMIN_DASHBOARD ||
    redirectUrl === ROUTES.TENANT_ADMIN_DASHBOARD ||
    redirectUrl === ROUTES.USER_DASHBOARD
  ) {
    return redirectUrl
  }

  const knownRoutes: Record<string, string> = {
    "/dashboard/system": ROUTES.SYSTEM_ADMIN_DASHBOARD,
    "/dashboard/tenant": ROUTES.TENANT_ADMIN_DASHBOARD,
    "/dashboard/user": ROUTES.USER_DASHBOARD,
    "/system-admin": ROUTES.SYSTEM_ADMIN_DASHBOARD,
    "/tenant-admin": ROUTES.TENANT_ADMIN_DASHBOARD,
    "/user": ROUTES.USER_DASHBOARD,
  }

  if (redirectUrl && knownRoutes[redirectUrl]) {
    return knownRoutes[redirectUrl]
  }

  return getDashboardRouteForRole(role)
}

export const getProjectPath = (projectId: string) => {
  return `/projects/${projectId}`
}

export const getProjectFolderPath = (projectId: string, folderId: string) => {
  return `/projects/${projectId}/folders/${folderId}`
}

export const getProjectFilePath = (projectId: string, fileId: string) => {
  return `/projects/${projectId}/files/${fileId}`
}
