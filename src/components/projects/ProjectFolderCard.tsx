import { useEffect, useState } from "react";
import { Check, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface IProjectFolderCardProps {
  name: string;
  filesCount: number;
  isActive?: boolean;
  isEditing?: boolean;
  onClick?: () => void;
  onNameSubmit?: (nextName: string) => void;
}

export const ProjectFolderCard = ({
  name,
  filesCount,
  isActive = false,
  isEditing = false,
  onClick,
  onNameSubmit,
}: IProjectFolderCardProps) => {
  const [draftName, setDraftName] = useState(name);

  useEffect(() => {
    setDraftName(name);
  }, [name]);

  const handleSubmitName = () => {
    const trimmedName = draftName.trim();

    onNameSubmit?.(trimmedName || name);
  };

  if (isEditing) {
    return (
      <div
        className={cn(
          "flex min-h-16 items-center justify-between rounded-md border bg-card px-4 py-3 text-left transition-all",
          "border-blue-500 ring-1 ring-blue-200"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Folder className="h-4 w-4 shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1">
            <input
              value={draftName}
              autoFocus
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={handleSubmitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSubmitName();
                }

                if (event.key === "Escape") {
                  setDraftName(name);
                  onNameSubmit?.(name);
                }
              }}
              className="w-full rounded border border-blue-300 bg-background px-2 py-1 text-sm font-semibold text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <p className="mt-1 text-xs text-muted-foreground">{filesCount} Files</p>
          </div>
        </div>

        <span className="ml-3 rounded-full text-blue-600">
          <Check className="h-4 w-4" />
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-16 items-center justify-between rounded-md border bg-card px-4 py-3 text-left transition-all",
        isActive
          ? "border-blue-500 ring-1 ring-blue-200"
          : "border-border hover:border-blue-300"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Folder className="h-4 w-4 shrink-0 text-blue-600" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{filesCount} Files</p>
        </div>
      </div>

      {isActive && (
        <span className="ml-3 rounded-full text-blue-600">
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  );
};
