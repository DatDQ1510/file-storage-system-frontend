import { useNavigate, useParams } from "react-router";
import { getProjectPath } from "@/constants/routes";

export const ProjectFileDetail = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  if (!projectId) {
    return null;
  }

  // TODO: Load file details from API and render file viewer
  // For now, redirect back to project
  navigate(getProjectPath(projectId), { replace: true });

  return null;
};
