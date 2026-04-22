import {
  ChevronRight,
  Folder,
  FolderOpen,
  Loader2,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  getChildFolderPaths,
  getProjectMembersForAcl,
  searchFolderPaths,
} from "@/pages/user/projects/services/folder-service"
import type {
  ICreateFolderWithAclRequest,
  IFolderAclItemRequest,
  IFolderPathNode,
  IProjectMemberForAcl,
} from "@/pages/user/projects/types/folder"
import {
  FOLDER_PERMISSION_READ,
  FOLDER_PERMISSION_WRITE,
  FOLDER_PERMISSION_DELETE,
} from "@/pages/user/projects/types/folder"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ICreateProjectFolderModalProps {
  projectId: string
  isOpen: boolean
  isSubmitting: boolean
  /** Khi được truyền vào, đây là id của folder cha (tạo subfolder).
   *  Khi undefined/null → tạo ở root (path browser hiển thị để chọn parent). */
  parentFolderId?: string | null
  onClose: () => void
  onSubmit: (request: ICreateFolderWithAclRequest) => Promise<void>
}

interface IAclDraft {
  id: string
  userId: string
  userLabel: string
  /** bitmask 1–7 */
  permission: number
}

interface IExpandedState {
  [path: string]: {
    isExpanded: boolean
    children: IFolderPathNode[]
    isLoading: boolean
  }
}

// ─── Permission bits config ───────────────────────────────────────────────────

const PERMISSION_BITS = [
  { bit: FOLDER_PERMISSION_READ, label: "Read" },
  { bit: FOLDER_PERMISSION_WRITE, label: "Write" },
  { bit: FOLDER_PERMISSION_DELETE, label: "Delete" },
]

const permissionLabel = (perm: number): string => {
  const labels = PERMISSION_BITS.filter((b) => (perm & b.bit) === b.bit).map((b) => b.label)
  return labels.length ? labels.join(" + ") : "None"
}

const permissionBadgeColor = (perm: number): string => {
  if (perm >= 7) return "bg-purple-100 text-purple-700"
  if ((perm & FOLDER_PERMISSION_WRITE) > 0) return "bg-emerald-100 text-emerald-700"
  return "bg-blue-100 text-blue-700"
}

// ─── Path breadcrumb ─────────────────────────────────────────────────────────

const PathBreadcrumb = ({ path }: { path: string }) => {
  const parts = path === "/" ? [] : path.split("/").filter(Boolean)
  return (
    <div className="flex items-center gap-1 text-sm flex-wrap">
      <span className="font-medium text-slate-700">Root</span>
      {parts.map((part, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-medium text-slate-700">{part}</span>
        </span>
      ))}
    </div>
  )
}

// ─── Tree node ────────────────────────────────────────────────────────────────

const PathTreeNode = ({
  node, selectedPath, expandedState, onSelect, onToggle, depth = 0,
}: {
  node: IFolderPathNode
  selectedPath: string
  expandedState: IExpandedState
  onSelect: (n: IFolderPathNode) => void
  onToggle: (n: IFolderPathNode) => void
  depth?: number
}) => {
  const state = expandedState[node.path]
  const isExpanded = state?.isExpanded ?? false
  const isLoading = state?.isLoading ?? false
  const children = state?.children ?? []
  const isSelected = selectedPath === node.path

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${isSelected ? "bg-cyan-50 border border-cyan-200" : "hover:bg-slate-50"
          }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <button
          type="button"
          className="flex-shrink-0 h-5 w-5 flex items-center justify-center text-slate-400"
          onClick={(e) => { e.stopPropagation(); if (node.hasChildren || isExpanded) onToggle(node) }}
          disabled={!node.hasChildren && !isExpanded}
        >
          {node.hasChildren || isExpanded ? (
            isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          ) : <span className="h-3.5 w-3.5" />}
        </button>

        {isExpanded
          ? <FolderOpen className="h-4 w-4 flex-shrink-0 text-amber-500" />
          : <Folder className="h-4 w-4 flex-shrink-0 text-amber-400" />}

        <button type="button" className="flex-1 text-left text-sm text-slate-700 truncate" onClick={() => onSelect(node)}>
          {node.nameFolder}
        </button>

        {isSelected && (
          <span className="flex-shrink-0 text-xs font-medium text-cyan-700 bg-cyan-100 rounded px-1.5 py-0.5">Selected</span>
        )}
      </div>

      {isExpanded && children.length > 0 && children.map((child) => (
        <PathTreeNode
          key={child.folderId} node={child} selectedPath={selectedPath}
          expandedState={expandedState} onSelect={onSelect} onToggle={onToggle} depth={depth + 1}
        />
      ))}
    </div>
  )
}

// ─── Permission checkboxes ────────────────────────────────────────────────────

const PermissionCheckboxes = ({
  value, onChange,
}: { value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center gap-4">
    {PERMISSION_BITS.map(({ bit, label }) => {
      const checked = (value & bit) === bit
      return (
        <label key={bit} className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onChange(checked ? value & ~bit : value | bit)}
            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span className="text-sm text-slate-700">{label}</span>
        </label>
      )
    })}
  </div>
)

// ─── Main modal ──────────────────────────────────────────────────────────────

export const CreateProjectFolderModal = ({
  projectId, isOpen, isSubmitting, parentFolderId, onClose, onSubmit,
}: ICreateProjectFolderModalProps) => {
  const [folderName, setFolderName] = useState("")
  const [selectedPath, setSelectedPath] = useState("/")
  const [errorMessage, setErrorMessage] = useState("")

  // Path browser
  const [rootNodes, setRootNodes] = useState<IFolderPathNode[]>([])
  const [isLoadingRoot, setIsLoadingRoot] = useState(false)
  const [expandedState, setExpandedState] = useState<IExpandedState>({})
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState<IFolderPathNode[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ACL
  const [projectMembers, setProjectMembers] = useState<IProjectMemberForAcl[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [draftPermission, setDraftPermission] = useState<number>(FOLDER_PERMISSION_READ)
  const [aclDrafts, setAclDrafts] = useState<IAclDraft[]>([])

  useEffect(() => {
    if (!isOpen || !projectId) return
    setIsLoadingRoot(true)
    getChildFolderPaths(projectId, "/").then(setRootNodes).catch(() => setRootNodes([])).finally(() => setIsLoadingRoot(false))
    setIsLoadingMembers(true)
    getProjectMembersForAcl(projectId).then(setProjectMembers).catch(() => setProjectMembers([])).finally(() => setIsLoadingMembers(false))
  }, [isOpen, projectId])

  const resetForm = useCallback(() => {
    setFolderName(""); setSelectedPath("/"); setErrorMessage("")
    setExpandedState({}); setRootNodes([]); setSearchKeyword("")
    setSearchResults(null); setIsSearchMode(false)
    setProjectMembers([]); setSelectedMemberId(""); setDraftPermission(FOLDER_PERMISSION_READ); setAclDrafts([])
  }, [])

  const handleClose = () => { if (isSubmitting) return; resetForm(); onClose() }

  const handleToggle = useCallback(async (node: IFolderPathNode) => {
    const current = expandedState[node.path]
    if (current?.isExpanded) {
      setExpandedState((prev) => ({ ...prev, [node.path]: { ...prev[node.path], isExpanded: false } }))
      return
    }
    if (current?.children?.length) {
      setExpandedState((prev) => ({ ...prev, [node.path]: { ...prev[node.path], isExpanded: true } }))
      return
    }
    setExpandedState((prev) => ({ ...prev, [node.path]: { isExpanded: true, children: [], isLoading: true } }))
    try {
      const children = await getChildFolderPaths(projectId, node.path)
      setExpandedState((prev) => ({ ...prev, [node.path]: { isExpanded: true, children, isLoading: false } }))
    } catch {
      setExpandedState((prev) => ({ ...prev, [node.path]: { isExpanded: true, children: [], isLoading: false } }))
    }
  }, [expandedState, projectId])

  const handleSelectNode = (node: IFolderPathNode) => {
    setSelectedPath(node.path); setIsSearchMode(false); setSearchKeyword(""); setSearchResults(null)
  }

  const handleSearchChange = (kw: string) => {
    setSearchKeyword(kw)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!kw.trim()) { setIsSearchMode(false); setSearchResults(null); return }
    setIsSearchMode(true); setIsSearching(true)
    debounceRef.current = setTimeout(async () => {
      try { setSearchResults(await searchFolderPaths(projectId, kw)) }
      catch { setSearchResults([]) }
      finally { setIsSearching(false) }
    }, 300)
  }

  const selectedMember = projectMembers.find((m) => m.userId === selectedMemberId)
  const alreadyInDraft = aclDrafts.some((d) => d.userId === selectedMemberId)

  const handleAddAcl = () => {
    if (!selectedMemberId || !selectedMember || draftPermission < 1) return
    const label = selectedMember.email ? `${selectedMember.userName} (${selectedMember.email})` : selectedMember.userName
    if (alreadyInDraft) {
      setAclDrafts((prev) => prev.map((d) => d.userId === selectedMemberId ? { ...d, permission: draftPermission } : d))
    } else {
      setAclDrafts((prev) => [...prev, { id: `${selectedMemberId}-${Date.now()}`, userId: selectedMemberId, userLabel: label, permission: draftPermission }])
    }
    setSelectedMemberId(""); setDraftPermission(FOLDER_PERMISSION_READ)
  }

  const handleSubmit = async () => {
    if (!folderName.trim()) { setErrorMessage("Folder name is required."); return }
    setErrorMessage("")
    const aclEntries: IFolderAclItemRequest[] = aclDrafts
      .filter((d) => d.userId.trim() && d.permission >= 1)
      .map((d) => ({ userId: d.userId, permission: d.permission }))

    // Khi có parentFolderId (tạo subfolder) → truyền trực tiếp, bỏ qua selectedPath
    // Khi không có (tạo ở root) → dùng selectedPath từ path browser
    const request: ICreateFolderWithAclRequest = {
      nameFolder: folderName.trim(),
      ...(parentFolderId
        ? { parentFolderId }
        : { path: selectedPath }
      ),
      aclEntries: aclEntries.length ? aclEntries : undefined,
    }
    await onSubmit(request)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={handleClose} aria-label="Close modal" />

      <div className="relative z-10 flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {isSubmitting && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-700" /> Creating folder...
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">
              {parentFolderId ? "Create Sub-folder" : "Create Folder"}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {parentFolderId
                ? "Create a new folder inside the current folder"
                : "Set a name, path, and optional access permissions"}
            </p>
          </div>
          <button type="button" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" onClick={handleClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Folder Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Folder name <span className="text-red-500">*</span>
            </label>
            <input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Documents"
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200"
            />
          </div>

          {/* Path Browser – chỉ hiển thị khi tạo folder ở root (không có parentFolderId) */}
          {!parentFolderId ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Path</label>
            <div className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <Folder className="h-4 w-4 flex-shrink-0 text-amber-400" />
              <PathBreadcrumb path={selectedPath} />
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchKeyword}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search folder by path…"
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-cyan-500"
              />
              {searchKeyword && (
                <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => { setSearchKeyword(""); setIsSearchMode(false); setSearchResults(null) }}>
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Tree / Search results */}
            <div className="max-h-52 overflow-y-auto rounded-md border border-slate-200 bg-white">
              {isSearchMode ? (
                isSearching ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Searching…</div>
                ) : !searchResults?.length ? (
                  <div className="px-3 py-3 text-sm text-slate-400">No folders found.</div>
                ) : (
                  <div className="p-1">
                    {searchResults.map((node) => (
                      <button key={node.folderId} type="button"
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-50 ${selectedPath === node.path ? "bg-cyan-50 text-cyan-700 font-medium" : "text-slate-700"}`}
                        onClick={() => handleSelectNode(node)}>
                        <Folder className="h-4 w-4 flex-shrink-0 text-amber-400" />
                        <span className="truncate font-mono text-xs">{node.path}</span>
                        {selectedPath === node.path && <span className="ml-auto text-xs text-cyan-700">✓</span>}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-1">
                  {/* Root row */}
                  <div
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer ${selectedPath === "/" ? "bg-cyan-50 border border-cyan-200" : "hover:bg-slate-50"}`}
                    onClick={() => setSelectedPath("/")}
                  >
                    <span className="h-5 w-5" />
                    <FolderOpen className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-slate-700 font-medium">/ (root)</span>
                    {selectedPath === "/" && <span className="ml-auto text-xs font-medium text-cyan-700 bg-cyan-100 rounded px-1.5 py-0.5">Selected</span>}
                  </div>

                  {isLoadingRoot ? (
                    <div className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</div>
                  ) : rootNodes.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-slate-400">No subfolders yet.</div>
                  ) : rootNodes.map((node) => (
                    <PathTreeNode key={node.folderId} node={node} selectedPath={selectedPath}
                      expandedState={expandedState} onSelect={handleSelectNode} onToggle={handleToggle} />
                  ))}
                </div>
              )}
            </div>
          </div>
          ) : (
            /* Banner: tạo subfolder bên trong folder hiện tại */
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <FolderOpen className="h-5 w-5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-slate-800">Creating inside current folder</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  The new folder will be created as a sub-folder of the currently open folder.
                </p>
              </div>
            </div>
          )}

          {/* Folder ACL */}
          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Folder ACL</p>
              <span className="text-xs text-slate-400">optional – leaves empty to inherit project permissions</span>
            </div>

            {/* Member selector */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Select project member</label>
              <select
                value={selectedMemberId}
                onChange={(e) => { setSelectedMemberId(e.target.value); setDraftPermission(FOLDER_PERMISSION_READ) }}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-cyan-500"
                disabled={isLoadingMembers}
              >
                <option value="">{isLoadingMembers ? "Loading members…" : "— Select member —"}</option>
                {projectMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.email ? `${m.userName} (${m.email})` : m.userName}
                  </option>
                ))}
              </select>
            </div>

            {/* Permission checkboxes – only show when member selected */}
            {selectedMemberId && (
              <div className="rounded-md bg-slate-50 border border-slate-100 px-3 py-2.5 space-y-2">
                <p className="text-xs font-medium text-slate-600">Permissions for {selectedMember?.userName}</p>
                <PermissionCheckboxes value={draftPermission} onChange={setDraftPermission} />
                {alreadyInDraft && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                    Already in list – clicking "Update" will replace their current permission.
                  </p>
                )}
                <div className="flex justify-end">
                  <Button
                    type="button" size="sm"
                    className="h-8 bg-cyan-700 text-white hover:bg-cyan-800 disabled:opacity-50"
                    disabled={draftPermission < 1}
                    onClick={handleAddAcl}
                  >
                    {alreadyInDraft ? "Update" : "Add to ACL"}
                  </Button>
                </div>
              </div>
            )}

            {/* Draft list */}
            {aclDrafts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">ACL Entries ({aclDrafts.length})</p>
                {aclDrafts.map((draft) => (
                  <div key={draft.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="min-w-0 flex-1 truncate text-sm text-slate-700">{draft.userLabel}</p>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${permissionBadgeColor(draft.permission)}`}>
                      {permissionLabel(draft.permission)}
                    </span>
                    <button type="button"
                      className="flex-shrink-0 rounded p-0.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setAclDrafts((prev) => prev.filter((d) => d.id !== draft.id))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{errorMessage}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
          <Button
            type="button"
            className="bg-cyan-700 text-white hover:bg-cyan-800"
            disabled={!folderName.trim() || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? "Creating…" : "Create folder"}
          </Button>
        </div>
      </div>
    </div>
  )
}
