import {
  FileText,
  Image,
  Sheet,
  Clapperboard,
  Folder,
  FileBadge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IRecentPageData } from "@/types/recent";

const MOCK_RECENT_DATA: IRecentPageData = {
  groups: [
    {
      id: "today",
      label: "Today",
      files: [
        {
          id: "1",
          name: "Q4_Financial_Strategy_v2.pdf",
          location: "Enterprise / Financials / 2024",
          timeLabel: "10:42 AM",
          size: "4.2 MB",
          type: "pdf",
        },
        {
          id: "2",
          name: "Hero_Banner_Concept_v2.png",
          location: "Design / Marketing / Campaigns",
          timeLabel: "9:15 AM",
          size: "12.8 MB",
          type: "image",
        },
      ],
    },
    {
      id: "yesterday",
      label: "Yesterday",
      files: [
        {
          id: "3",
          name: "User_Analytics_Export_Aug24.csv",
          location: "Product / Analytics / Raw_Data",
          timeLabel: "4:50 PM",
          size: "890 KB",
          type: "csv",
        },
      ],
    },
    {
      id: "last-week",
      label: "Last Week",
      files: [
        {
          id: "4",
          name: "Onboarding_Walkthrough_Draft.mp4",
          location: "Training / HR / Onboarding",
          timeLabel: "Aug 22, 11:20 AM",
          size: "142.5 MB",
          type: "video",
        },
        {
          id: "5",
          name: "Project_Archive_2023",
          location: "Shared / Archives",
          timeLabel: "Aug 20, 09:00 AM",
          size: "12 GB",
          type: "folder",
        },
        {
          id: "6",
          name: "Security_Policy_Final.pdf",
          location: "Compliance / Legal / 2024",
          timeLabel: "Aug 19, 02:15 PM",
          size: "2.1 MB",
          type: "pdf",
        },
      ],
    },
  ],
};

const FILE_ICON_MAP = {
  pdf: <FileText className="h-5 w-5 text-blue-600" />,
  image: <Image className="h-5 w-5 text-purple-600" />,
  csv: <Sheet className="h-5 w-5 text-orange-600" />,
  video: <Clapperboard className="h-5 w-5 text-blue-600" />,
  folder: <Folder className="h-5 w-5 text-emerald-600" />,
} as const;

export const Recent = () => {
  const data = MOCK_RECENT_DATA;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Recent Files
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your most recently modified assets and documents.
          </p>
        </div>

      </section>

      {data.groups.map((group) => (
        <section key={group.id} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {group.label}
          </h2>

          <div className="overflow-hidden rounded-md border border-border bg-card">
            {group.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center border-b border-border px-5 py-4 last:border-b-0"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50">
                    {FILE_ICON_MAP[file.type]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {file.location}
                    </p>
                  </div>
                </div>

                <div className="flex w-44 justify-end text-xs text-foreground/80">
                  {file.timeLabel}
                </div>
                <div className="flex w-24 justify-end text-xs text-slate-500">
                  {file.size}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="fixed bottom-6 right-6 z-20">
        <Button size="icon" className="h-12 w-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
          <FileBadge className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
