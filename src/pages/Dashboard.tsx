import { Navigate } from "react-router"
import { ROUTES, normalizeDashboardRoute } from "@/constants/routes"
import { getStoredAuthData } from "@/lib/api/auth-service"

export const Dashboard = () => {
  const authData = getStoredAuthData()
  const targetRoute = normalizeDashboardRoute(
    authData?.redirectUrl,
    authData?.role
  )

  return <Navigate replace to={targetRoute || ROUTES.SIGN_IN} />
}
