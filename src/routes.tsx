import type { ReactNode } from "react"
import { Navigate, Route, Routes } from "react-router"
import { ROUTES } from "@/constants/routes"
import { Layout } from "@/layout"
import { Dashboard } from "@/pages/Dashboard.tsx"
import { ForgotPassword } from "@/pages/ForgotPassword"
import { Forbidden } from "@/pages/Forbidden"
import { Projects } from "@/pages/Projects"
import { Recent } from "@/pages/Recent"
import { SignIn } from "@/pages/SignIn"
import { SignUp } from "@/pages/SignUp"
import { Starred } from "@/pages/Starred"
import { TotpSignIn } from "@/pages/TotpSignIn"
import { SystemAdminPage } from "@/pages/system-admin/SystemAdminPage"
import { TenantAdminPage } from "@/pages/tenant-admin/TenantAdminPage"

interface IRouteConfig {
  path: string
  element: ReactNode
}

const renderRouteConfigs = (routeConfigs: IRouteConfig[]) => {
  return routeConfigs.map(({ path, element }) => (
    <Route key={path} element={element} path={path} />
  ))
}

const AUTH_ROUTES: IRouteConfig[] = [
  { path: ROUTES.SIGN_IN, element: <SignIn /> },
  { path: ROUTES.TOTP_SIGN_IN, element: <TotpSignIn /> },
  { path: ROUTES.SIGN_UP, element: <SignUp /> },
  { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
  { path: ROUTES.FORBIDDEN, element: <Forbidden /> },
]

const DASHBOARD_ENTRY_ROUTES: IRouteConfig[] = [
  { path: ROUTES.HOME, element: <Dashboard /> },
  { path: ROUTES.DASHBOARD, element: <Dashboard /> },
]

const LEGACY_REDIRECT_ROUTES: IRouteConfig[] = [
  {
    path: "/system-admin",
    element: <Navigate replace to={ROUTES.SYSTEM_ADMIN_DASHBOARD} />,
  },
  {
    path: "/tenant-admin",
    element: <Navigate replace to={ROUTES.TENANT_ADMIN_DASHBOARD} />,
  },
  { path: "/user", element: <Navigate replace to={ROUTES.USER_DASHBOARD} /> },
  {
    path: "/dashboard/system",
    element: <Navigate replace to={ROUTES.SYSTEM_ADMIN_DASHBOARD} />,
  },
  {
    path: "/dashboard/tenant",
    element: <Navigate replace to={ROUTES.TENANT_ADMIN_DASHBOARD} />,
  },
]

const ROLE_DASHBOARD_ROUTES: IRouteConfig[] = [
  { path: ROUTES.SYSTEM_ADMIN_DASHBOARD, element: <SystemAdminPage /> },
  { path: ROUTES.TENANT_ADMIN_DASHBOARD, element: <TenantAdminPage /> },
  { path: ROUTES.USER_DASHBOARD, element: <Navigate replace to={ROUTES.RECENT} /> },
]

const APP_ROUTES: IRouteConfig[] = [
  { path: ROUTES.RECENT, element: <Layout><Recent /></Layout> },
  { path: ROUTES.STARRED, element: <Layout><Starred /></Layout> },
  { path: ROUTES.PROJECTS, element: <Layout><Projects /></Layout> },
  { path: ROUTES.PROJECT_DETAIL, element: <Layout><Projects /></Layout> },
  { path: ROUTES.RECYCLE_BIN, element: <Layout><Dashboard /></Layout> },
  { path: ROUTES.SUPPORT, element: <Layout><Dashboard /></Layout> },
]

export const AppRoutes = () => {
  return (
    <Routes>
      {renderRouteConfigs(AUTH_ROUTES)}
      {renderRouteConfigs(DASHBOARD_ENTRY_ROUTES)}
      {renderRouteConfigs(LEGACY_REDIRECT_ROUTES)}
      {renderRouteConfigs(ROLE_DASHBOARD_ROUTES)}
      {renderRouteConfigs(APP_ROUTES)}
      <Route element={<Navigate replace to={ROUTES.FORBIDDEN} />} path="*" />
    </Routes>
  )
}