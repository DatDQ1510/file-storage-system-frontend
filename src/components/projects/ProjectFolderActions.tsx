import { Button } from "@/components/ui/button";

interface IProjectFolderActionsProps {
  showAddUserButton?: boolean;
  onAddUser?: () => void;
  showViewUsersButton?: boolean;
  onViewUsers?: () => void;
}

export const ProjectFolderActions = ({
  showAddUserButton,
  onAddUser,
  showViewUsersButton,
  onViewUsers,
}: IProjectFolderActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showAddUserButton && onAddUser && (
        <Button variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={onAddUser}>
          Add user in project
        </Button>
      )}
      {showViewUsersButton && onViewUsers && (
        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={onViewUsers}>
          View users in project
        </Button>
      )}
    </div>
  );
};
