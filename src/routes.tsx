import { Suspense, lazy, type ReactNode } from "react"
import { Navigate, Route, Routes } from "react-router"
import { ROUTES } from "@/constants/routes"
import { Layout } from "@/layout"
import { isAuthenticated } from "@/lib/api/auth-service"

const Dashboard = lazy(() => import("@/pages/user/Dashboard").then((module) => ({ default: module.Dashboard })))
const ForgotPassword = lazy(() => import("@/pages/user/ForgotPassword").then((module) => ({ default: module.ForgotPassword })))
const Forbidden = lazy(() => import("@/pages/user/Forbidden").then((module) => ({ default: module.Forbidden })))
const ProjectFileDetail = lazy(() => import("@/pages/user/projects").then((module) => ({ default: module.ProjectFileDetail })))
const ProjectFolderDetail = lazy(() => import("@/pages/user/projects").then((module) => ({ default: module.ProjectFolderDetail })))
const Projects = lazy(() => import("@/pages/user/projects").then((module) => ({ default: module.Projects })))
const RecycleBin = lazy(() => import("@/pages/user/recycle-bin").then((module) => ({ default: module.RecycleBin })))
const Recent = lazy(() => import("@/pages/user/recent").then((module) => ({ default: module.Recent })))
const SignIn = lazy(() => import("@/pages/user/SignIn").then((module) => ({ default: module.SignIn })))
const SignUp = lazy(() => import("@/pages/user/SignUp").then((module) => ({ default: module.SignUp })))
const SetupPassword = lazy(() => import("@/pages/user/SetupPassword").then((module) => ({ default: module.SetupPassword })))
const Starred = lazy(() => import("@/pages/user/starred").then((module) => ({ default: module.Starred })))
const TotpSignIn = lazy(() => import("@/pages/user/TotpSignIn").then((module) => ({ default: module.TotpSignIn })))
const SystemAdminPage = lazy(() => import("@/pages/system-admin/SystemAdminPage").then((module) => ({ default: module.SystemAdminPage })))
const CreatePlanPage = lazy(() => import("@/pages/system-admin/pages/CreatePlanPage").then((module) => ({ default: module.CreatePlanPage })))
const TenantAdminPage = lazy(() => import("@/pages/tenant-admin/TenantAdminPage").then((module) => ({ default: module.TenantAdminPage })))

interface IRouteConfig {
  path: string
  element: ReactNode
}

const withSuspense = (element: ReactNode) => {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">Loading...</div>}>
      {element}
    </Suspense>
  )
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
  // Temporary bypass for UI testing without auth.
  // if (!isAuthenticated()) {
  //   return <Navigate replace to={ROUTES.SIGN_IN} />
  // }

  return children
}

const AUTH_ROUTES: IRouteConfig[] = [
  {
    path: ROUTES.SIGN_IN,
    element: <PublicOnlyRoute>{withSuspense(<SignIn />)}</PublicOnlyRoute>,
  },
  {
    path: ROUTES.TOTP_SIGN_IN,
    element: <PublicOnlyRoute>{withSuspense(<TotpSignIn />)}</PublicOnlyRoute>,
  },
  {
    path: ROUTES.SIGN_UP,
    element: <PublicOnlyRoute>{withSuspense(<SignUp />)}</PublicOnlyRoute>,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <PublicOnlyRoute>{withSuspense(<ForgotPassword />)}</PublicOnlyRoute>,
  },
  {
    path: ROUTES.SETUP_PASSWORD,
    element: withSuspense(<SetupPassword />),
  },
  { path: ROUTES.FORBIDDEN, element: withSuspense(<Forbidden />) },
]

const DASHBOARD_ENTRY_ROUTES: IRouteConfig[] = [
  {
    path: ROUTES.HOME,
    element: <ProtectedRoute>{withSuspense(<Dashboard />)}</ProtectedRoute>,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <ProtectedRoute>{withSuspense(<Dashboard />)}</ProtectedRoute>,
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
    element: <ProtectedRoute>{withSuspense(<SystemAdminPage />)}</ProtectedRoute>,
  },
  {
    path: ROUTES.SYSTEM_ADMIN_CREATE_PLAN,
    element: <ProtectedRoute>{withSuspense(<CreatePlanPage />)}</ProtectedRoute>,
  },
  {
    path: ROUTES.TENANT_ADMIN_DASHBOARD,
    element: <ProtectedRoute>{withSuspense(<TenantAdminPage />)}</ProtectedRoute>,
  },
  {
    path: ROUTES.USER_DASHBOARD,
    element: <ProtectedRoute><Navigate replace to={ROUTES.RECENT} /></ProtectedRoute>,
  },
]

const APP_ROUTES: IRouteConfig[] = [
  {
    path: ROUTES.RECENT,
    element: <ProtectedRoute><Layout>{withSuspense(<Recent />)}</Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.STARRED,
    element: <ProtectedRoute><Layout>{withSuspense(<Starred />)}</Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.PROJECTS,
    element: <ProtectedRoute><Layout>{withSuspense(<Projects />)}</Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.PROJECT_DETAIL,
    element: <ProtectedRoute><Layout>{withSuspense(<Projects />)}</Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.PROJECT_FOLDER_DETAIL,
    element: <ProtectedRoute><Layout>{withSuspense(<ProjectFolderDetail />)}</Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.PROJECT_FILE_DETAIL,
    element: <ProtectedRoute><Layout>{withSuspense(<ProjectFileDetail />)}</Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.RECYCLE_BIN,
    element: <ProtectedRoute><Layout>{withSuspense(<RecycleBin />)}</Layout></ProtectedRoute>,
  },
  {
    path: ROUTES.SUPPORT,
    element: <ProtectedRoute><Layout>{withSuspense(<Dashboard />)}</Layout></ProtectedRoute>,
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
