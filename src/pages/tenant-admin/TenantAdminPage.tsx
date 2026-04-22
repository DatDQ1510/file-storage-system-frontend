import { useCallback, useEffect, useRef, useState } from "react"
import {
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/common/Header"
import { Button } from "@/components/ui/button"
import { getCurrentUser, getStoredAuthData } from "@/lib/api/auth-service"
import { DashboardSection } from "@/pages/tenant-admin/components/sections/DashboardSection"
import { OrganizationSection } from "@/pages/tenant-admin/components/sections/OrganizationSection"
import { ProjectsSection } from "@/pages/tenant-admin/components/sections/ProjectsSection"
import { AddProjectMemberModal } from "@/pages/tenant-admin/components/sections/projects/AddProjectMemberModal"
import { CreateProjectModal } from "@/pages/tenant-admin/components/sections/projects/CreateProjectModal"
import { SecuritySection } from "@/pages/tenant-admin/components/sections/SecuritySection"
import { TenantSidebar } from "@/pages/tenant-admin/components/TenantSidebar"
import {
  getSectionDescription,
  getSectionTitle,
} from "@/pages/tenant-admin/constants"
import {
  addProjectMember,
  createProject,
  loadProjectDirectoryPage,
  searchProjectOwners,
} from "@/pages/tenant-admin/services/project-service"
import type {
  IAddProjectMemberRequest,
  IProjectOwnerOption,
  IProjectRecord,
  IProjectRequest,
  IProjectResponse,
  TTenantAdminSection,
} from "@/pages/tenant-admin/types"
import type { TUserRole } from "@/types/auth"

const TENANT_ADMIN_ROLE_LABELS: Record<TUserRole, string> = {
  SYSTEM_ADMIN: "Quản trị viên hệ thống",
  TENANT_ADMIN: "Quản trị viên tenant",
  USER: "Người dùng",
}

const mapProjectStatus = (status?: string): IProjectRecord["status"] => {
  const normalizedStatus = status?.trim().toUpperCase() ?? ""

  if (normalizedStatus.includes("ARCH")) {
    return "Archived"
  }

  if (normalizedStatus.includes("PLAN") || normalizedStatus.includes("PENDING")) {
    return "Planning"
  }

  return "Active"
}

const mapCreatedProjectToRecord = (
  project: IProjectResponse,
  ownerId: string,
  ownerName: string,
  fallbackId: string
): IProjectRecord => {
  const status = mapProjectStatus(project.status)

  return {
    id: project.id?.trim() ? project.id : fallbackId,
    name: project.nameProject?.trim() ? project.nameProject : "Dự án chưa đặt tên",
    ownerId: project.ownerId?.trim() ? project.ownerId : ownerId,
    department: "Chung",
    pm: project.ownerName?.trim() ? project.ownerName : ownerName,
    membersCount: 1,
    storageUsed: "0GB",
    storageTotal: "100GB",
    storagePercent: 0,
    status,
    icon: "folder",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  }
}

export const TenantAdminPage = () => {
  const authData = getStoredAuthData()
  const currentUserId = authData?.userId?.trim() ?? ""
  const [headerAccountName, setHeaderAccountName] = useState(
    authData?.userDisplayName?.trim() || authData?.username?.trim() || "Quản trị viên tenant"
  )
  const [headerAccountEmail, setHeaderAccountEmail] = useState(
    authData?.email?.trim() || "tenant-admin@workspace.local"
  )
  const [activeSection, setActiveSection] = useState<TTenantAdminSection>("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projectRecords, setProjectRecords] = useState<IProjectRecord[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [projectPage, setProjectPage] = useState(0)
  const [projectSize] = useState(10)
  const [projectTotalElements, setProjectTotalElements] = useState(0)
  const [projectTotalPages, setProjectTotalPages] = useState(1)
  const [projectHasNext, setProjectHasNext] = useState(false)
  const [projectHasPrevious, setProjectHasPrevious] = useState(false)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [isAddProjectMemberModalOpen, setIsAddProjectMemberModalOpen] = useState(false)
  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [isSubmittingProjectMember, setIsSubmittingProjectMember] = useState(false)
  const [selectedProjectForMember, setSelectedProjectForMember] = useState<IProjectRecord | null>(null)
  const projectLoadRequestSequenceRef = useRef(0)
  const headerRoleLabel = authData?.role
    ? TENANT_ADMIN_ROLE_LABELS[authData.role]
    : "Quản trị viên tenant"

  const loadProjects = useCallback(async (page: number, size: number) => {
    const requestSequence = projectLoadRequestSequenceRef.current + 1
    projectLoadRequestSequenceRef.current = requestSequence
    setIsLoadingProjects(true)

    try {
      const projectPageResponse = await loadProjectDirectoryPage({
        page,
        size,
      })

      if (requestSequence !== projectLoadRequestSequenceRef.current) {
        return
      }

      setProjectRecords(projectPageResponse.items)
      setProjectPage(projectPageResponse.page)
      setProjectTotalElements(projectPageResponse.totalElements)
      setProjectTotalPages(Math.max(projectPageResponse.totalPages, 1))
      setProjectHasNext(projectPageResponse.hasNext)
      setProjectHasPrevious(projectPageResponse.hasPrevious)
    } catch (error) {
      if (requestSequence !== projectLoadRequestSequenceRef.current) {
        return
      }

      setProjectRecords([])
      setProjectTotalElements(0)
      setProjectTotalPages(1)
      setProjectHasNext(false)
      setProjectHasPrevious(page > 0)
      toast.error(error instanceof Error ? error.message : "Không thể tải danh sách dự án")
    } finally {
      if (requestSequence === projectLoadRequestSequenceRef.current) {
        setIsLoadingProjects(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadProjects(projectPage, projectSize)
  }, [loadProjects, projectPage, projectSize])

  useEffect(() => {
    if (!currentUserId) {
      return
    }

    let isMounted = true

    const loadCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser(currentUserId)

        if (!isMounted) {
          return
        }

        const normalizedName =
          currentUser.username?.trim() ||
          authData?.userDisplayName?.trim() ||
          authData?.username?.trim() ||
          "Quản trị viên tenant"
        const normalizedEmail =
          currentUser.email?.trim() || authData?.email?.trim() || "tenant-admin@workspace.local"

        setHeaderAccountName(normalizedName)
        setHeaderAccountEmail(normalizedEmail)
      } catch {
        // Keep fallback values from authData when current user API is unavailable.
      }
    }

    void loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [authData?.email, authData?.userDisplayName, authData?.username, currentUserId])

  const handleOpenCreateProjectModal = () => {
    setIsCreateProjectModalOpen(true)
  }

  const handleCloseCreateProjectModal = () => {
    if (isSubmittingProject) {
      return
    }

    setIsCreateProjectModalOpen(false)
  }

  const handleCreateProject = async (input: IProjectRequest) => {
    setIsSubmittingProject(true)

    try {
      const createdProject = await createProject(input)
      const ownerName = createdProject.ownerName?.trim() ?? "Chủ dự án"
      const fallbackId = `proj-${String(projectRecords.length + 1).padStart(3, "0")}`

      setProjectRecords((current) => [
        mapCreatedProjectToRecord(createdProject, input.ownerId, ownerName, fallbackId),
        ...current,
      ])

      setIsCreateProjectModalOpen(false)
      toast.success("Tạo dự án thành công")

      if (projectPage !== 0) {
        setProjectPage(0)
      } else {
        void loadProjects(0, projectSize)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo dự án")
    } finally {
      setIsSubmittingProject(false)
    }
  }

  const handleUpdateProjectStatus = useCallback(
    (projectId: string, nextStatus: IProjectRecord["status"]) => {
      setProjectRecords((current) =>
        current.map((project) =>
          project.id === projectId
            ? {
                ...project,
                status: nextStatus,
              }
            : project
        )
      )

      toast.success(`Đã cập nhật trạng thái dự án sang ${nextStatus}`)
    },
    []
  )

  const handlePreviousProjectPage = () => {
    if (!projectHasPrevious || isLoadingProjects) {
      return
    }

    setProjectPage((current) => Math.max(current - 1, 0))
  }

  const handleNextProjectPage = () => {
    if (!projectHasNext || isLoadingProjects) {
      return
    }

    setProjectPage((current) => current + 1)
  }

  // Fetch function for project owners - used by CreateProjectModal
  const fetchProjectOwners = useCallback(async (keyword: string, signal?: AbortSignal): Promise<IProjectOwnerOption[]> => {
    const normalizedKeyword = keyword.trim()

    try {
      const owners = await searchProjectOwners({
        keyword: normalizedKeyword,
        page: 0,
        size: 10,
        signal,
      })

      return owners
    } catch {
      return []
    }
  }, [])

  // Fetch function for project members - used by AddProjectMemberModal
  const fetchProjectMemberUsers = useCallback(async (keyword: string, signal?: AbortSignal): Promise<IProjectOwnerOption[]> => {
    const normalizedKeyword = keyword.trim()

    try {
      const users = await searchProjectOwners({
        keyword: normalizedKeyword,
        page: 0,
        size: 10,
        signal,
      })

      return users
    } catch {
      return []
    }
  }, [])

  const handleOpenAddProjectMemberModal = (project: IProjectRecord) => {
    setSelectedProjectForMember(project)
    setIsAddProjectMemberModalOpen(true)
  }

  const handleCloseAddProjectMemberModal = () => {
    if (isSubmittingProjectMember) {
      return
    }

    setIsAddProjectMemberModalOpen(false)
    setSelectedProjectForMember(null)
  }

  const handleAddProjectMember = async (input: IAddProjectMemberRequest) => {
    if (!selectedProjectForMember) {
      toast.error("Không tìm thấy dự án để thêm thành viên")
      return
    }

    setIsSubmittingProjectMember(true)

    try {
      await addProjectMember({
        projectId: selectedProjectForMember.id,
        request: input,
      })

      toast.success("Thêm thành viên vào dự án thành công")
      setIsAddProjectMemberModalOpen(false)
      setSelectedProjectForMember(null)

      if (projectPage !== 0) {
        setProjectPage(0)
      } else {
        void loadProjects(0, projectSize)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể thêm thành viên vào dự án")
    } finally {
      setIsSubmittingProjectMember(false)
    }
  }

  return (
    <div
      className="admin-shell relative min-h-screen overflow-hidden bg-background text-foreground"
      style={{ fontFamily: '"Geist Variable", "IBM Plex Sans", "Segoe UI", sans-serif' }}
    >
      <div className="admin-shell-ambient pointer-events-none absolute inset-0" />

      <div className="relative flex min-h-screen">
        <div className="hidden xl:block">
          <TenantSidebar activeSection={activeSection} onSelectSection={setActiveSection} />
        </div>

        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 xl:hidden">
            <button
              aria-label="Đóng điều hướng"
              className="absolute inset-0 bg-slate-950/35"
              onClick={() => setIsSidebarOpen(false)}
              type="button"
            />
            <div className="relative h-full w-72 max-w-[88vw] shadow-2xl">
              <TenantSidebar
                activeSection={activeSection}
                onSelectSection={(section) => {
                  setActiveSection(section)
                  setIsSidebarOpen(false)
                }}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            accountAccentClassName="bg-cyan-100 text-cyan-700"
            accountEmail={headerAccountEmail}
            accountName={headerAccountName}
            accountRole={headerRoleLabel}
            containerClassName="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur"
            innerClassName="px-4 py-3 md:px-6 xl:px-8"
            leadingContent={
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Sovereign Architect</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="truncate font-semibold text-slate-700">Quản trị tenant</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="truncate font-semibold text-slate-700">{getSectionTitle(activeSection)}</span>
                </div>
                <h1 className="truncate text-3xl font-bold tracking-tight text-slate-950">{getSectionTitle(activeSection)}</h1>
              </div>
            }
            onMenuClick={() => setIsSidebarOpen(true)}
            searchPlaceholder="Tìm kiếm tài nguyên workspace..."
          />

          <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 xl:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-4xl text-sm leading-relaxed text-slate-600">{getSectionDescription(activeSection)}</p>

              <div className="flex items-center gap-2">
                {activeSection === "projects" && (
                  <>
                    <Button variant="outline" className="border-slate-300 bg-white">
                      Xuất báo cáo dự án
                    </Button>
                    <Button className="bg-cyan-700 text-white hover:bg-cyan-800" onClick={handleOpenCreateProjectModal}>
                      Thêm dự án
                    </Button>
                  </>
                )}

                {activeSection === "security" && (
                  <Button className="bg-cyan-700 text-white hover:bg-cyan-800">Tạo ảnh chụp bảo mật</Button>
                )}
              </div>
            </div>

            {activeSection === "dashboard" && <DashboardSection />}
            {activeSection === "projects" && (
              <ProjectsSection
                projectRecords={projectRecords}
                currentUserId={currentUserId}
                isLoadingProjects={isLoadingProjects}
                page={projectPage}
                size={projectSize}
                totalPages={projectTotalPages}
                totalElements={projectTotalElements}
                hasNext={projectHasNext}
                hasPrevious={projectHasPrevious}
                onPreviousPage={handlePreviousProjectPage}
                onNextPage={handleNextProjectPage}
                onOpenAddMemberModal={handleOpenAddProjectMemberModal}
                onUpdateProjectStatus={handleUpdateProjectStatus}
              />
            )}
            {activeSection === "organization" && <OrganizationSection />}
            {activeSection === "security" && <SecuritySection />}

            <CreateProjectModal
              isOpen={isCreateProjectModalOpen}
              isSubmitting={isSubmittingProject}
              fetchOwners={fetchProjectOwners}
              onClose={handleCloseCreateProjectModal}
              onSubmit={handleCreateProject}
            />

            <AddProjectMemberModal
              isOpen={isAddProjectMemberModalOpen}
              projectName={selectedProjectForMember?.name ?? ""}
              isSubmitting={isSubmittingProjectMember}
              fetchUsers={fetchProjectMemberUsers}
              onClose={handleCloseAddProjectMemberModal}
              onSubmit={handleAddProjectMember}
            />

          </main>
        </div>
      </div>
      <div className="admin-shell-gradient pointer-events-none fixed inset-0 -z-10" />
    </div>
  )
}
