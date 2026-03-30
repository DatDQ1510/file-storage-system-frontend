import type { IQuickAccessFile } from "@/types/dashboard";
import {
  FileText,
  Sheet,
  Lock,
  Presentation,
  File,
} from "lucide-react";

interface IQuickAccessSectionProps {
  files: IQuickAccessFile[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-8 w-8 text-red-500" />,
  excel: <Sheet className="h-8 w-8 text-green-500" />,
  security: <Lock className="h-8 w-8 text-blue-500" />,
  pptx: <Presentation className="h-8 w-8 text-orange-500" />,
  default: <File className="h-8 w-8 text-gray-500" />,
};

export const QuickAccessSection = ({
  files,
}: IQuickAccessSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        QUICK ACCESS
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-blue-300 hover:shadow-md cursor-pointer"
          >
            <div>
              {ICON_MAP[file.icon] || ICON_MAP.default}
            </div>
            <div>
              <p className="truncate text-sm font-medium text-foreground">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {file.dateModified}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{file.size}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
