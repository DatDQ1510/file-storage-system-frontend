import {
  FileSpreadsheet,
  FileText,
  Folder,
  Image,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type TRecycleAssetType = "folder" | "pdf" | "xlsx" | "image" | "presentation";

interface IRecycleBinAssetItem {
  id: string;
  name: string;
  summary: string;
  originalLocation: string;
  deletedDate: string;
  deletedTime: string;
  size: string;
  type: TRecycleAssetType;
}

const RECYCLE_BIN_ASSET_ITEMS: IRecycleBinAssetItem[] = [
  {
    id: "1",
    name: "Q3_Financial_Projections_Archive",
    summary: "Folder containing 12 documents",
    originalLocation: "/Corporate/Finance/Archives",
    deletedDate: "Oct 24, 2023",
    deletedTime: "14:22",
    size: "42.5 MB",
    type: "folder",
  },
  {
    id: "2",
    name: "Architectural_Blueprint_V4_FINAL.pdf",
    summary: "High-resolution schematic export",
    originalLocation: "/Projects/Skyline_Tower/Design",
    deletedDate: "Oct 22, 2023",
    deletedTime: "09:15",
    size: "118.2 MB",
    type: "pdf",
  },
  {
    id: "3",
    name: "User_Activity_Audit_Log_2023.csv",
    summary: "Security compliance data export",
    originalLocation: "/Security/Compliance/Logs",
    deletedDate: "Oct 21, 2023",
    deletedTime: "17:45",
    size: "8.4 MB",
    type: "xlsx",
  },
  {
    id: "4",
    name: "Site_Survey_Aerial_Photo.jpg",
    summary: "Drone imagery of construction site",
    originalLocation: "/Field_Data/Surveys/Visuals",
    deletedDate: "Oct 20, 2023",
    deletedTime: "11:30",
    size: "22.1 MB",
    type: "image",
  },
  {
    id: "5",
    name: "Stakeholder_Presentation_Draft.pptx",
    summary: "Powerpoint deck with video embeds",
    originalLocation: "/Marketing/Collateral/Presentations",
    deletedDate: "Oct 19, 2023",
    deletedTime: "08:00",
    size: "245.0 MB",
    type: "presentation",
  },
];

const getAssetIcon = (assetType: TRecycleAssetType) => {
  if (assetType === "folder") {
    return <Folder className="h-4 w-4 text-blue-600" />;
  }

  if (assetType === "pdf") {
    return <FileText className="h-4 w-4 text-red-500" />;
  }

  if (assetType === "xlsx") {
    return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
  }

  if (assetType === "image") {
    return <Image className="h-4 w-4 text-orange-500" />;
  }

  return <FileText className="h-4 w-4 text-amber-600" />;
};

export const RecycleBin = () => {
  return (
    <div className="space-y-8 pb-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-semibold text-blue-700">Recycle Bin</h1>
          <p className="text-sm text-muted-foreground">
            Items in the bin are permanently deleted after 30 days.
          </p>
        </div>

        <Button variant="outline" className="text-red-600 hover:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Empty Bin
        </Button>
      </section>

      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Repository Health
          </p>
          <h2 className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
            Audit Deleted Assets
          </h2>
        </div>

        <div className="flex gap-2">
          <div className="rounded-md border border-border bg-card px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total Size
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground">1.42 GB</p>
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Item Count
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground">24 Assets</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full min-w-170 text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              <th className="px-4 py-3">Asset Name & Origin</th>
              <th className="px-4 py-3">Original Location</th>
              <th className="px-4 py-3">Date Deleted</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Governance Actions</th>
            </tr>
          </thead>
          <tbody>
            {RECYCLE_BIN_ASSET_ITEMS.map((assetItem) => (
              <tr key={assetItem.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                      {getAssetIcon(assetItem.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">{assetItem.name}</p>
                      <p className="text-xs text-muted-foreground">{assetItem.summary}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-foreground/90">{assetItem.originalLocation}</td>
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{assetItem.deletedDate}</p>
                  <p className="text-xs text-muted-foreground">{assetItem.deletedTime}</p>
                </td>
                <td className="px-4 py-4 font-medium text-foreground">{assetItem.size}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RotateCcw className="mr-2 h-3.5 w-3.5" />
                      Restore
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-600">
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
