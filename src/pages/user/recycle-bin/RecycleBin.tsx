import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText, Image, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  emptyRecycleBinApi,
  getRecycleBinFilesApi,
  permanentlyDeleteRecycleBinFileApi,
  restoreRecycleBinFileApi,
  type IRecycleBinFileResponse,
} from "@/lib/api/recycle-bin-service";

type TRecycleAssetType = "pdf" | "xlsx" | "image" | "presentation";

const getAssetIcon = (assetType: TRecycleAssetType) => {
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

const resolveAssetType = (fileName: string): TRecycleAssetType => {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "xlsx";
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "presentation";
  return "image";
};

const formatFileSize = (sizeInMb: number) => {
  if (sizeInMb < 1) {
    return `${Math.max(1, Math.round(sizeInMb * 1024))} KB`;
  }

  return `${sizeInMb.toFixed(1)} MB`;
};

const formatDateLabel = (isoValue: string) => {
  const parsedDate = new Date(isoValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return isoValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const formatTimeLabel = (isoValue: string) => {
  const parsedDate = new Date(isoValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsedDate);
};

export const RecycleBin = () => {
  const [items, setItems] = useState<IRecycleBinFileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRecycleBin = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getRecycleBinFilesApi();
      setItems(response);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load recycle bin.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecycleBin();
  }, [loadRecycleBin]);

  const totalSize = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.sizeFile ?? 0), 0);
  }, [items]);

  const handleRestore = async (fileId: string) => {
    setIsSubmitting(true);
    try {
      await restoreRecycleBinFileApi(fileId);
      toast.success("File restored successfully");
      await loadRecycleBin();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restore file");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermanentDelete = async (fileId: string) => {
    if (!window.confirm("Delete this file permanently? This action cannot be undone.")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await permanentlyDeleteRecycleBinFileApi(fileId);
      toast.success("File deleted permanently");
      await loadRecycleBin();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete file permanently");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmptyBin = async () => {
    if (!window.confirm("Empty recycle bin? All items will be deleted permanently.")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await emptyRecycleBinApi();
      toast.success("Recycle bin emptied");
      await loadRecycleBin();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to empty recycle bin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-semibold text-blue-700">Recycle Bin</h1>
          <p className="text-sm text-muted-foreground">
            Items in the bin are permanently deleted after 30 days.
          </p>
        </div>

        <Button
          variant="outline"
          className="text-red-600 hover:text-red-600"
          onClick={() => void handleEmptyBin()}
          disabled={isLoading || isSubmitting || items.length === 0}
        >
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
            <p className="mt-1 text-xl font-semibold text-foreground">{formatFileSize(totalSize)}</p>
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Item Count
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground">{items.length} Assets</p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading recycle bin...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          Recycle bin is empty.
        </div>
      ) : (
        <section className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full min-w-170 text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                <th className="px-4 py-3">Asset Name</th>
                <th className="px-4 py-3">Original Location</th>
                <th className="px-4 py-3">Date Deleted</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((assetItem) => (
                <tr key={assetItem.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                        {getAssetIcon(resolveAssetType(assetItem.fileName))}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{assetItem.fileName}</p>
                        <p className="text-xs text-muted-foreground">Status: {assetItem.statusFile}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-foreground/90">{assetItem.folderPath || "-"}</td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-foreground">{formatDateLabel(assetItem.deletedAt)}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeLabel(assetItem.deletedAt)}</p>
                  </td>
                  <td className="px-4 py-4 font-medium text-foreground">{formatFileSize(assetItem.sizeFile)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleRestore(assetItem.id)}
                        disabled={isSubmitting}
                      >
                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-600"
                        onClick={() => void handlePermanentDelete(assetItem.id)}
                        disabled={isSubmitting}
                      >
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
      )}
    </div>
  );
};
