import {
  FileText,
  Sheet,
  Image,
  Presentation,
  Folder,
  Star
} from "lucide-react";
import type { IStarredPageData } from "@/types/starred";

const MOCK_STARRED_DATA: IStarredPageData = {
  folders: [
    { id: "1", name: "Q4 Financial Re...", filesCount: 12, size: "45.2 MB" },
    { id: "2", name: "Brand Guideline...", filesCount: 28, size: "1.2 GB" },
    { id: "3", name: "Product Roadm...", filesCount: 5, size: "8.4 MB" },
    { id: "4", name: "Investor Deck", filesCount: 2, size: "112 MB" },
  ],
  files: [
    {
      id: "1",
      name: "Executive_Summary_v2.pdf",
      dateLabel: "Oct 24, 2023",
      size: "2.4 MB",
      type: "pdf",
    },
    {
      id: "2",
      name: "Q4_Budget_Projection.xlsx",
      dateLabel: "Yesterday",
      size: "845 KB",
      type: "excel",
    },
    {
      id: "3",
      name: "Vault_Hero_Asset_Final.png",
      dateLabel: "Oct 20, 2023",
      size: "12.8 MB",
      type: "image",
    },
    {
      id: "4",
      name: "Vault_Enterprise_Pitch.pptx",
      dateLabel: "2h ago",
      size: "42.1 MB",
      type: "presentation",
    },
  ],
  auditItems: [
    {
      id: "1",
      message: "You starred investor_deck.pdf",
      timeLabel: "2 minutes ago",
    },
    {
      id: "2",
      message: "Folder 'Marketing' shared",
      timeLabel: "1 hour ago",
    },
  ],
};

const FILE_ICON_MAP = {
  pdf: <FileText className="h-5 w-5 text-blue-600" />,
  excel: <Sheet className="h-5 w-5 text-green-600" />,
  image: <Image className="h-5 w-5 text-orange-600" />,
  presentation: <Presentation className="h-5 w-5 text-purple-600" />,
} as const;

export const Starred = () => {
  const data = MOCK_STARRED_DATA;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Starred
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick access to your most important collections and files.
          </p>
        </div>

      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-400">
            STARRED FOLDERS
          </h2>
          <p className="text-xs text-slate-400">{data.folders.length} Items</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.folders.map((folder) => (
            <article
              key={folder.id}
              className="rounded-md border border-border bg-card px-5 py-6 transition-colors hover:border-blue-200"
            >
              <div className="flex items-center justify-between">
                <Folder className="h-6 w-6 text-blue-700" />
                <Star className="h-4 w-4 fill-amber-600 text-amber-600" />
              </div>
              <p className="mt-8 truncate text-2xl font-medium leading-none text-foreground">
                {folder.name}
              </p>
              <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                {folder.filesCount} Files · {folder.size}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-400">
            STARRED FILES
          </h2>
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <span>{data.files.length} Files</span>
            <span className="font-semibold text-blue-700">Name</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border bg-card">
          {data.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center border-b border-border px-5 py-4 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50">
                  {FILE_ICON_MAP[file.type]}
                </div>
                <p className="truncate text-sm font-medium text-foreground">
                  {file.name}
                  <Star className="ml-2 inline h-3.5 w-3.5 fill-amber-600 text-amber-600" />
                </p>
              </div>
              <div className="flex w-56 justify-end text-xs text-muted-foreground">
                {file.dateLabel}
              </div>
              <div className="flex w-24 justify-end text-xs text-slate-500">
                {file.size}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
        <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-border bg-muted/20">
          <div className="text-center">
            <Copy className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
              Drag files here to star them instantly
            </p>
          </div>
        </div>

        <aside className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
              AUDIT STREAM
            </h3>
            <span className="h-2 w-2 rounded-full bg-green-500" />
          </div>

          <div className="mt-4 space-y-2">
            {data.auditItems.map((auditItem) => (
              <div key={auditItem.id} className="rounded bg-muted/40 p-3">
                <p className="text-xs font-medium text-foreground">{auditItem.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {auditItem.timeLabel}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section> */}
    </div>
  );
};
