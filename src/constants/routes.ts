export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  DASHBOARD: "/dashboard",
  RECENT: "/recent",
  STARRED: "/starred",
  PROJECTS: "/projects",
  RECYCLE_BIN: "/recycle-bin",
  SUPPORT: "/support",
} as const;

export type RouteKey = keyof typeof ROUTES;
