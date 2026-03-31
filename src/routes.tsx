import { Routes, Route, Navigate } from "react-router";
import { Layout } from "@/layout";
import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Recent } from "@/pages/Recent";
import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";
import { Starred } from "@/pages/Starred";
import { ROUTES } from "@/constants/routes";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<SignIn />} path={ROUTES.SIGN_IN} />
      <Route element={<SignUp />} path={ROUTES.SIGN_UP} />
      <Route element={<Layout>{<Dashboard />}</Layout>} path={ROUTES.HOME} />
      <Route element={<Layout>{<Recent />}</Layout>} path={ROUTES.RECENT} />
      <Route element={<Layout>{<Starred />}</Layout>} path={ROUTES.STARRED} />
      <Route element={<Layout>{<Projects />}</Layout>} path={ROUTES.PROJECTS} />
      <Route element={<Layout>{<Dashboard />}</Layout>} path={ROUTES.RECYCLE_BIN} />
      <Route element={<Layout>{<Dashboard />}</Layout>} path={ROUTES.SUPPORT} />
      <Route element={<Navigate to={ROUTES.HOME} replace />} path="*" />
    </Routes>
  );
};