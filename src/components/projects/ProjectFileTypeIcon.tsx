import type { ReactNode } from "react";
import { FileText, FileSpreadsheet, FileType2, Image } from "lucide-react";

type TProjectFileType = "pdf" | "docx" | "xlsx" | "png";

interface IProjectFileTypeIconProps {
  fileType: TProjectFileType;
}

const FILE_ICON_MAP: Record<TProjectFileType, ReactNode> = {
  pdf: <FileText className="h-4 w-4 text-red-500" />,
  docx: <FileType2 className="h-4 w-4 text-blue-500" />,
  xlsx: <FileSpreadsheet className="h-4 w-4 text-green-600" />,
  png: <Image className="h-4 w-4 text-orange-500" />,
};

export const ProjectFileTypeIcon = ({ fileType }: IProjectFileTypeIconProps) => {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted">
      {FILE_ICON_MAP[fileType]}
    </span>
  );
};

export type { TProjectFileType };
