import { useEffect, useRef, useState } from "react";
import { Check, Folder, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IFolderMenuAction {
  folderId: string;
  onRename?: (folderId: string, newName: string) => Promise<void>;
  onDelete?: (folderId: string) => Promise<void>;
  canWrite?: boolean;
  canDelete?: boolean;
}

interface IProjectFolderCardProps {
  folderId?: string;
  name: string;
  filesCount: number;
  isActive?: boolean;
  onClick?: () => void;
  menuActions?: IFolderMenuAction;
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
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button
      type="button"
      className="absolute inset-0 bg-slate-950/40"
      onClick={onCancel}
      aria-label="Close dialog"
    />
    <div className="relative z-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      <p className="mt-1.5 text-sm text-slate-500">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60",
            confirmClass ?? "bg-cyan-700 hover:bg-cyan-800"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onCancel}
        aria-label="Close rename dialog"
      />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h4 className="text-base font-semibold text-slate-900">Rename Folder</h4>
        <p className="mt-1 text-sm text-slate-500">Enter a new name for this folder.</p>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) onConfirm(draft.trim());
            if (e.key === "Escape") onCancel();
          }}
          className="mt-3 h-9 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-cyan-800 disabled:opacity-60"
            onClick={() => { if (draft.trim()) onConfirm(draft.trim()) }}
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

// ─── Main card ────────────────────────────────────────────────────────────────

export const ProjectFolderCard = ({
  folderId,
  name,
  filesCount,
  isActive = false,
  onClick,
  menuActions,
}: IProjectFolderCardProps) => {
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
    if (!menuActions?.onRename || !folderId) return;
    setIsActionLoading(true);
    try {
      await menuActions.onRename(folderId, newName);
      setShowRename(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!menuActions?.onDelete || !folderId) return;
    setIsActionLoading(true);
    try {
      await menuActions.onDelete(folderId);
      setShowDelete(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group flex min-h-16 items-center justify-between rounded-md border bg-card px-4 py-3 transition-all",
          isActive ? "border-blue-500 ring-1 ring-blue-200" : "border-border hover:border-blue-300"
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Folder className="h-4 w-4 shrink-0 text-blue-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{filesCount} Files</p>
          </div>
        </button>

        <div className="flex items-center gap-1 ml-2">
          {isActive && (
            <span className="rounded-full text-blue-600">
              <Check className="h-4 w-4" />
            </span>
          )}

          {/* Edit icon menu */}
          {hasMenu && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                className="rounded-md p-1 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
                aria-label="Folder actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  {menuActions.canWrite && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setShowRename(true) }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-400" />
                      Rename
                    </button>
                  )}
                  {menuActions.canDelete && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setShowDelete(true) }}
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
      </div>

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
          title="Delete folder?"
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
