import { Button } from "@/components/ui/button";

interface IProjectFolderActionsProps {
  showAddUserButton?: boolean;
  onAddUser?: () => void;
}

export const ProjectFolderActions = ({
  showAddUserButton,
  onAddUser,
}: IProjectFolderActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showAddUserButton && onAddUser && (
        <Button variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={onAddUser}>
          Add user in project
        </Button>
      )}
    </div>
  );
};
