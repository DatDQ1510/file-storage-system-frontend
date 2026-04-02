export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  TOTP_SIGN_IN: "/sign-in/totp",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  RECENT: "/recent",
  STARRED: "/starred",
  PROJECTS: "/projects",
  PROJECT_DETAIL: "/projects/:projectId",
  RECYCLE_BIN: "/recycle-bin",
  SUPPORT: "/support",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const getProjectPath = (projectId: string) => {
  return `/projects/${projectId}`;
};
