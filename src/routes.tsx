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
import { CreatePlanPage } from "@/pages/system-admin/pages/CreatePlanPage"
import { TenantAdminPage } from "@/pages/tenant-admin/TenantAdminPage"
import { isAuthenticated } from "@/lib/api/auth-service"

interface IRouteConfig {
  path: string
  element: ReactNode
}

const renderRouteConfigs = (routeConfigs: IRouteConfig[]) => {
  return routeConfigs.map(({ path, element }) => (
    <Route key={path} element={element} path={path} />
  ))
}

const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  if (isAuthenticated()) {
    return <Navigate replace to={ROUTES.HOME} />
  }

  return children
}

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate replace to={ROUTES.SIGN_IN} />
  }

  return children
}

const AUTH_ROUTES: IRouteConfig[] = [
  {
    path: ROUTES.SIGN_IN,
    element: <PublicOnlyRoute><SignIn /></PublicOnlyRoute>,
  },
  {
    path: ROUTES.TOTP_SIGN_IN,
    element: <PublicOnlyRoute><TotpSignIn /></PublicOnlyRoute>,
  },
  {
    path: ROUTES.SIGN_UP,
    element: <PublicOnlyRoute><SignUp /></PublicOnlyRoute>,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>,
  },
  { path: ROUTES.FORBIDDEN, element: <Forbidden /> },
]

const DASHBOARD_ENTRY_ROUTES: IRouteConfig[] = [
  {
    path: ROUTES.HOME,
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
]

const LEGACY_REDIRECT_ROUTES: IRouteConfig[] = [
  {
    path: "/system-admin",
    element: <ProtectedRoute><Navigate replace to={ROUTES.SYSTEM_ADMIN_DASHBOARD} /></ProtectedRoute>,
  },
  {
    path: "/tenant-admin",
    element: <ProtectedRoute><Navigate replace to={ROUTES.TENANT_ADMIN_DASHBOARD} /></ProtectedRoute>,
  },
  {
    path: "/user",
    element: <ProtectedRoute><Navigate replace to={ROUTES.USER_DASHBOARD} /></ProtectedRoute>,
  },
  {
    path: "/dashboard/system",
    element: <ProtectedRoute><Navigate replace to={ROUTES.SYSTEM_ADMIN_DASHBOARD} /></ProtectedRoute>,
  },
  {
    path: "/dashboard/tenant",
    element: <ProtectedRoute><Navigate replace to={ROUTES.TENANT_ADMIN_DASHBOARD} /></ProtectedRoute>,
  },
]

const ROLE_DASHBOARD_ROUTES: IRouteConfig[] = [
  {
    path: ROUTES.SYSTEM_ADMIN_DASHBOARD,
    element: <ProtectedRoute><SystemAdminPage /></ProtectedRoute>,
  },
  {
    path: ROUTES.SYSTEM_ADMIN_CREATE_PLAN,
    element: <ProtectedRoute><CreatePlanPage /></ProtectedRoute>,
  },
  {
    path: ROUTES.TENANT_ADMIN_DASHBOARD,
    element: <ProtectedRoute><TenantAdminPage /></ProtectedRoute>,
  },
  {
    path: ROUTES.USER_DASHBOARD,
    element: <ProtectedRoute><Navigate replace to={ROUTES.RECENT} /></ProtectedRoute>,
  },
]

const APP_ROUTES: IRouteConfig[] = [
  {
    path: ROUTES.RECENT,
    element: <ProtectedRoute><Layout><Recent /></Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.STARRED,
    element: <ProtectedRoute><Layout><Starred /></Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.PROJECTS,
    element: <ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.PROJECT_DETAIL,
    element: <ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.RECYCLE_BIN,
    element: <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.SUPPORT,
    element: <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>,
  },
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