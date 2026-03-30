export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  RECENT: "/recent",
  STARRED: "/starred",
  PROJECTS: "/projects",
  RECYCLE_BIN: "/recycle-bin",
  SUPPORT: "/support",
} as const;

export type RouteKey = keyof typeof ROUTES;
