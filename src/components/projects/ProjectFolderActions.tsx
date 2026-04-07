import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IProjectFolderActionsProps {
  onCreateFolder: () => void;
  onUploadFolder: () => void;
  onUploadFile: () => void;
}

export const ProjectFolderActions = ({
  onCreateFolder,
  onUploadFolder,
  onUploadFile,
}: IProjectFolderActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={onCreateFolder}>
        <Plus className="mr-2 h-4 w-4" />
        New Folder
      </Button>
      <Button variant="outline" onClick={onUploadFolder}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Folder
      </Button>
      <Button variant="outline" onClick={onUploadFile}>
        <Upload className="mr-2 h-4 w-4" />
        Upload File
      </Button>
    </div>
  );
};
