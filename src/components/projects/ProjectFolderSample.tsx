import { ProjectFolderCard } from "@/components/projects/ProjectFolderCard";

export const ProjectFolderSample = () => {
  return (
    <div className="max-w-xs">
      <ProjectFolderCard
        name="Folder Component Sample"
        filesCount={12}
        isActive
      />
    </div>
  );
};
