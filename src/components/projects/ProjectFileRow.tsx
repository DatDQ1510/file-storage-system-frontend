import { useEffect, useRef, useState } from "react";
import { Check, Loader2, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { ProjectFileTypeIcon, type TProjectFileType } from "@/components/projects/ProjectFileTypeIcon";
import { cn } from "@/lib/utils";

interface IFileMenuAction {
  fileId: string;
  onRename?: (fileId: string, newName: string) => Promise<void>;
  onDelete?: (fileId: string) => Promise<void>;
  canWrite?: boolean;
  canDelete?: boolean;
}

interface IProjectFileRowProps {
  fileId: string;
  name: string;
  owner: string;
  size: string;
  lastModified: string;
  fileType: TProjectFileType;
  isStarred?: boolean;
  isStarLoading?: boolean;
  onToggleStar?: () => void;
  onClick?: () => void;
  menuActions?: IFileMenuAction;
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

const ConfirmDialog = ({
  title,
  description,
  confirmLabel,
  confirmClass,
  isLoading,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass?: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <button
      type="button"
      className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70"
      onClick={onCancel}
      aria-label="Close dialog"
    />
    <div className="relative z-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60",
            confirmClass ?? "bg-blue-600 hover:bg-blue-700"
          )}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Rename dialog ────────────────────────────────────────────────────────────

const RenameDialog = ({
  currentName,
  isLoading,
  onConfirm,
  onCancel,
}: {
  currentName: string;
  isLoading: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) => {
  const [draft, setDraft] = useState(currentName);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70"
        onClick={onCancel}
        aria-label="Close rename dialog"
      />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Rename File</h4>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter a new name for this file.</p>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) onConfirm(draft.trim());
            if (e.key === "Escape") onCancel();
          }}
          className="mt-3 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={() => {
              if (draft.trim()) onConfirm(draft.trim());
            }}
            disabled={isLoading || !draft.trim()}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Rename
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Row ─────────────────────────────────────────────────────────────────

export const ProjectFileRow = ({
  fileId,
  name,
  owner,
  size,
  lastModified,
  fileType,
  isStarred = false,
  isStarLoading = false,
  onToggleStar,
  onClick,
  menuActions,
}: IProjectFileRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const hasMenu = menuActions && (menuActions.canWrite || menuActions.canDelete);

  const handleRenameConfirm = async (newName: string) => {
    if (!menuActions?.onRename) return;
    setIsActionLoading(true);
    try {
      await menuActions.onRename(fileId, newName);
      setShowRename(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!menuActions?.onDelete) return;
    setIsActionLoading(true);
    try {
      await menuActions.onDelete(fileId);
      setShowDelete(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <>
      <tr
        className="group border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
      >
        <td className="px-4 py-4">
          <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <ProjectFileTypeIcon fileType={fileType} />
            <span className="font-medium text-foreground hover:text-blue-600 transition-colors">{name}</span>
          </button>
        </td>
        <td className="px-4 py-4 text-foreground/70">{owner}</td>
        <td className="px-4 py-4 text-foreground/70">{lastModified}</td>
        <td className="px-4 py-4 text-foreground/70">{size}</td>
        <td className="px-4 py-4 text-right">
          <div className="flex items-center justify-end gap-1">
            {onToggleStar && (
              <button
                type="button"
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                onClick={(e) => {
                  e.stopPropagation();
                  void onToggleStar();
                }}
                disabled={isStarLoading}
                aria-label={isStarred ? "Unstar file" : "Star file"}
                title={isStarred ? "Unstar file" : "Star file"}
              >
                <Star className={cn("h-4 w-4", isStarred ? "fill-amber-400 text-amber-400" : "")} />
              </button>
            )}

            {hasMenu && (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  className="rounded-md p-1.5 text-slate-400 opacity-0 transition-all group-hover:opacity-100 focus:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((v) => !v);
                  }}
                  aria-label="File actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-[100] mt-1 min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900 text-left">
                    {menuActions.canWrite && (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          setShowRename(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-400" />
                        Rename
                      </button>
                    )}
                    {menuActions.canDelete && (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          setShowDelete(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Rename dialog */}
      {showRename && (
        <RenameDialog
          currentName={name}
          isLoading={isActionLoading}
          onConfirm={handleRenameConfirm}
          onCancel={() => setShowRename(false)}
        />
      )}

      {/* Delete confirm dialog */}
      {showDelete && (
        <ConfirmDialog
          title="Delete file?"
          description={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
          isLoading={isActionLoading}
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
};
