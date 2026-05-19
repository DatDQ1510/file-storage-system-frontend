import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import {
  FileText,
  Sheet,
  Image,
  Presentation,
  Folder,
  Loader2,
  Star,
  RefreshCw,
} from "lucide-react"
import { getProjectFilePath, getProjectFolderPath } from "@/constants/routes"
import { toast } from "sonner"
import {
  getStarredPageApi,
  unstarFileApi,
  unstarFolderApi,
  type IStarredPageResponse,
} from "@/lib/api/starred-service"

type TStarredFileType = "pdf" | "excel" | "image" | "presentation"

const FILE_ICON_MAP: Record<TStarredFileType, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-blue-600" />,
  excel: <Sheet className="h-5 w-5 text-green-600" />,
  image: <Image className="h-5 w-5 text-orange-600" />,
  presentation: <Presentation className="h-5 w-5 text-purple-600" />,
}

const resolveStarredFileType = (fileName: string): TStarredFileType => {
  const lower = fileName.toLowerCase()

  if (lower.endsWith(".pdf")) return "pdf"
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "excel"
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "presentation"
  return "image"
}

const formatFileSize = (sizeInMb: number) => {
  if (sizeInMb < 1) {
    return `${Math.max(1, Math.round(sizeInMb * 1024))} KB`
  }

  return `${sizeInMb.toFixed(1)} MB`
}

const formatDateLabel = (isoValue: string) => {
  const parsedDate = new Date(isoValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return isoValue
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate)
}

export const Starred = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<IStarredPageResponse>({ folders: [], files: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadStarredItems = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await getStarredPageApi()
      setData(response)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load starred items.")
      setData({ folders: [], files: [] })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStarredItems()
  }, [loadStarredItems])

  const hasData = useMemo(() => data.folders.length > 0 || data.files.length > 0, [data.folders, data.files])

  const sortedFolders = useMemo(() => {
    return [...data.folders].sort((a, b) => new Date(b.starredAt).getTime() - new Date(a.starredAt).getTime())
  }, [data.folders])

  const sortedFiles = useMemo(() => {
    return [...data.files].sort((a, b) => new Date(b.starredAt).getTime() - new Date(a.starredAt).getTime())
  }, [data.files])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadStarredItems()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleUnstarFolder = async (folderId: string) => {
    try {
      await unstarFolderApi(folderId)
      toast.success("Folder removed from starred")
      await loadStarredItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unstar folder")
    }
  }

  const handleUnstarFile = async (fileId: string) => {
    try {
      await unstarFileApi(fileId)
      toast.success("File removed from starred")
      await loadStarredItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unstar file")
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Starred</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick access to your most important collections and files.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={isLoading || isRefreshing}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </section>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading starred items...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : !hasData ? (
        <div className="rounded-xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          No starred files or folders yet.
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-500">STARRED FOLDERS</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{sortedFolders.length} Items</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {sortedFolders.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-card/70 px-4 py-6 text-sm text-muted-foreground">
                  No starred folders.
                </div>
              ) : null}

              {sortedFolders.map((folder) => (
                <article
                  key={folder.starId}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(getProjectFolderPath(folder.projectId, folder.folderId))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      navigate(getProjectFolderPath(folder.projectId, folder.folderId))
                    }
                  }}
                  className="rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <Folder className="h-4 w-4 text-blue-600" />
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-amber-600 transition-colors hover:border-amber-300"
                      onClick={(event) => {
                        event.stopPropagation()
                        void handleUnstarFolder(folder.folderId)
                      }}
                      aria-label="Unstar folder"
                      title="Unstar folder" 
                    >
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    </button>
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold text-foreground">
                    {folder.folderName}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{folder.path}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Starred on {formatDateLabel(folder.starredAt)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-500">STARRED FILES</h2>
              <div className="flex items-center gap-5 text-xs text-slate-400 dark:text-slate-500">
                <span>{sortedFiles.length} Files</span>
                <span className="font-semibold text-blue-700">Name</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-border bg-card">
              {sortedFiles.length === 0 ? (
                <div className="px-5 py-6 text-sm text-muted-foreground">No starred files.</div>
              ) : null}

              {sortedFiles.map((file) => (
                <div
                  key={file.starId}
                  role="button"
                  tabIndex={0}
                  className="flex items-center border-b border-border px-5 py-4 transition-colors hover:bg-muted/40 last:border-b-0"
                  onClick={() => navigate(getProjectFilePath(file.projectId, file.fileId))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      navigate(getProjectFilePath(file.projectId, file.fileId))
                    }
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50 dark:bg-slate-900">
                      {FILE_ICON_MAP[resolveStarredFileType(file.fileName)]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {file.fileName}
                        <Star className="ml-2 inline h-3.5 w-3.5 fill-amber-600 text-amber-600" />
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{file.folderPath}</p>
                    </div>
                  </div>

                  <div className="flex w-56 justify-end text-xs text-muted-foreground">
                    {formatDateLabel(file.starredAt)}
                  </div>
                  <div className="flex w-24 justify-end text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.sizeFile)}
                  </div>
                  <button
                    type="button"
                    className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-amber-600 transition-colors hover:border-amber-300"
                    onClick={(event) => {
                      event.stopPropagation()
                      void handleUnstarFile(file.fileId)
                    }}
                    aria-label="Unstar file"
                    title="Unstar file"
                  >
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}