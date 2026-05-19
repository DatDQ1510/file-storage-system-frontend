import { UserPlus, Users } from "lucide-react";
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
        <Button
          variant="outline"
          className="h-11 rounded-full border-slate-200 bg-white/90 px-4 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:bg-cyan-900/50 dark:hover:text-cyan-200"
          onClick={onAddUser}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add user in project
        </Button>
      )}
      {showViewUsersButton && onViewUsers && (
        <Button
          variant="outline"
          className="h-11 rounded-full border-slate-200 bg-white/90 px-4 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-200"
          onClick={onViewUsers}
        >
          <Users className="mr-2 h-4 w-4" />
          View users in project
        </Button>
      )}
    </div>
  );
};
