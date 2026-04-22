import { useEffect, useState } from "react"
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Cloud,
  Copy,
  Check,
  Ellipsis,
  ExternalLink,
  Filter,
  FolderKanban,
  Landmark,
  Search,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjectPath } from "@/constants/routes"
import { cn } from "@/lib/utils"
import { getProjectStatusClassName, getProjectStatusLabel } from "@/pages/tenant-admin/constants"
import type { IProjectRecord } from "@/pages/tenant-admin/types"

const PROJECT_ICON_MAP = {
  folder: FolderKanban,
  cloud_queue: Cloud,
  gavel: Landmark,
  palette: Building2,
  account_balance: Landmark,
} as const

const copyTextToClipboard = async (value: string) => {
  if (!value.trim()) {
    return false
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return true
  }

  return false
}

interface IProjectRowActionsMenuProps {
  project: IProjectRecord
  onUpdateStatus: (projectId: string, nextStatus: IProjectRecord["status"]) => void
}

const ProjectRowActionsMenu = ({ project, onUpdateStatus }: IProjectRowActionsMenuProps) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(`[data-project-actions="${project.id}"]`)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, project.id])

  const handleCopyValue = async (value: string, label: string) => {
    const copied = await copyTextToClipboard(value)

    if (copied) {
      toast.success(`Đã sao chép ${label}`)
    } else {
      toast.error("Không thể sao chép vào bộ nhớ tạm")
    }

    setIsOpen(false)
  }

  const handleOpenProject = () => {
    navigate(getProjectPath(project.id))
    setIsOpen(false)
  }

  const statusOptions: IProjectRecord["status"][] = ["Active", "Planning", "Archived"]

  return (
    <div className="relative inline-flex" data-project-actions={project.id}>
      <Button
        size="icon-sm"
        variant="ghost"
        className="text-slate-500"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Ellipsis className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl" role="menu">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={handleOpenProject}
            role="menuitem"
          >
            <ExternalLink className="h-4 w-4" />
            Mở dự án
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => void handleCopyValue(project.id, "mã dự án")}
            role="menuitem"
          >
            <Copy className="h-4 w-4" />
            Sao chép mã dự án
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => void handleCopyValue(project.name, "tên dự án")}
            role="menuitem"
          >
            <Copy className="h-4 w-4" />
            Sao chép tên dự án
          </button>
          <div className="my-1 border-t border-slate-200" />
          {statusOptions.map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => {
                onUpdateStatus(project.id, statusOption)
                setIsOpen(false)
              }}
              role="menuitem"
            >
              <Check className="h-4 w-4" />
              Đặt {getProjectStatusLabel(statusOption)}
              {project.status === statusOption && <span className="ml-auto text-xs text-cyan-700">Hiện tại</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface IProjectsSectionProps {
  projectRecords: IProjectRecord[]
  currentUserId: string
  isLoadingProjects: boolean
  page: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrevious: boolean
  onPreviousPage: () => void
  onNextPage: () => void
  onOpenAddMemberModal: (project: IProjectRecord) => void
  onUpdateProjectStatus: (projectId: string, nextStatus: IProjectRecord["status"]) => void
}

export const ProjectsSection = ({
  projectRecords,
  currentUserId,
  isLoadingProjects,
  page,
  size,
  totalPages,
  totalElements,
  hasNext,
  hasPrevious,
  onPreviousPage,
  onNextPage,
  onOpenAddMemberModal,
  onUpdateProjectStatus,
}: IProjectsSectionProps) => {
  const activeProjects = projectRecords.filter((project) => project.status === "Active").length
  const planningProjects = projectRecords.filter((project) => project.status === "Planning").length
  const archivedProjects = projectRecords.filter((project) => project.status === "Archived").length
  const visibleFrom = projectRecords.length > 0 ? page * size + 1 : 0
  const visibleTo = projectRecords.length > 0
    ? Math.min(page * size + projectRecords.length, totalElements)
    : 0

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tổng dự án", value: `${totalElements}`, foot: "trong danh mục tenant" },
          { label: "Đang triển khai", value: `${activeProjects}`, foot: "trong trang hiện tại" },
          { label: "Lên kế hoạch", value: `${planningProjects}`, foot: "trong trang hiện tại" },
          { label: "Lưu trữ", value: `${archivedProjects}`, foot: "trong trang hiện tại" },
        ].map((summary) => (
          <Card key={summary.label} className="border-slate-200 bg-white">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{summary.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{summary.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{summary.foot}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-slate-900">Danh mục workspace dự án</CardTitle>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Tìm dự án hoặc PM"
                type="text"
              />
            </label>

            <Button size="sm" variant="outline" className="border-slate-300 text-slate-600">
              <Filter className="h-4 w-4" />
              Lọc
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  <th className="py-3">Dự án</th>
                  <th className="py-3">Thành viên</th>
                  <th className="py-3">Lưu trữ</th>
                  <th className="py-3">Trạng thái</th>
                  <th className="py-3 text-right">Thao tác</th>
                </tr>
              </thead>

            <tbody>
              {isLoadingProjects ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    Đang tải dự án...
                  </td>
                </tr>
              ) : projectRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    Không tìm thấy dự án.
                  </td>
                </tr>
              ) : (
                projectRecords.map((project) => {
                  const Icon = PROJECT_ICON_MAP[project.icon as keyof typeof PROJECT_ICON_MAP] ?? FolderKanban
                  const canManageMembers =
                    Boolean(currentUserId.trim()) &&
                    Boolean(project.ownerId.trim()) &&
                    project.ownerId.trim() === currentUserId.trim()

                  return (
                    <tr key={project.id} className="border-b border-slate-100 last:border-none">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("grid h-10 w-10 place-items-center rounded-lg", project.iconBg, project.iconColor)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{project.name}</p>
                            <p className="text-xs text-slate-500">QLDA: {project.pm}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          <Users className="h-3.5 w-3.5" />
                          {project.membersCount} thành viên
                        </div>
                      </td>

                      <td>
                        <div className="w-32">
                          <p className="mb-1 text-xs font-semibold text-slate-700">{project.storageUsed} / {project.storageTotal}</p>
                          <div className="h-2 rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${project.storagePercent}%` }} />
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-semibold", getProjectStatusClassName(project.status))}>
                          {getProjectStatusLabel(project.status)}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageMembers && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                              onClick={() => onOpenAddMemberModal(project)}
                            >
                              Thêm thành viên
                            </Button>
                          )}
                          <ProjectRowActionsMenu project={project} onUpdateStatus={onUpdateProjectStatus} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
            <p className="text-slate-500">Hiển thị {visibleFrom} - {visibleTo} trên tổng {totalElements} dự án</p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="text-slate-500" onClick={onPreviousPage} disabled={!hasPrevious || isLoadingProjects}>
                <ChevronRight className="h-4 w-4 rotate-180" />
                Trước
              </Button>
              <span className="px-2 text-xs text-slate-600">Trang {page + 1}/{totalPages}</span>
              <Button size="sm" variant="ghost" className="text-slate-500" onClick={onNextPage} disabled={!hasNext || isLoadingProjects}>
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
