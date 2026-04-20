import { useCallback, useEffect, useRef, useState } from "react"
import {
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/common/Header"
import { Button } from "@/components/ui/button"
import { getStoredAuthData } from "@/lib/api/auth-service"
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

const PROJECT_OWNER_OPTIONS: IProjectOwnerOption[] = [
  { id: "usr-001", name: "Sarah Jenkins" },
  { id: "usr-002", name: "Admin David" },
  { id: "usr-003", name: "Marcus Thorne" },
  { id: "usr-004", name: "Kevin Art" },
  { id: "usr-005", name: "Janet Doe" },
]

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
    name: project.nameProject?.trim() ? project.nameProject : "Untitled Project",
    ownerId: project.ownerId?.trim() ? project.ownerId : ownerId,
    department: "General",
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
  const currentUserId = getStoredAuthData()?.userId?.trim() ?? ""
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
  const [projectOwnerOptions, setProjectOwnerOptions] = useState<IProjectOwnerOption[]>(PROJECT_OWNER_OPTIONS)
  const [projectMemberUserOptions, setProjectMemberUserOptions] = useState<IProjectOwnerOption[]>([])
  const [isSearchingOwners, setIsSearchingOwners] = useState(false)
  const [isSearchingProjectMembers, setIsSearchingProjectMembers] = useState(false)
  const [selectedProjectForMember, setSelectedProjectForMember] = useState<IProjectRecord | null>(null)
  const ownerSearchRequestSequenceRef = useRef(0)
  const memberSearchRequestSequenceRef = useRef(0)
  const projectLoadRequestSequenceRef = useRef(0)

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

  const handleOpenCreateProjectModal = () => {
    setProjectOwnerOptions(PROJECT_OWNER_OPTIONS)
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
      const ownerName =
        projectOwnerOptions.find((owner) => owner.id === input.ownerId)?.name ??
        "Project Owner"
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

  const handleSearchProjectOwners = useCallback(async (keyword: string) => {
    const normalizedKeyword = keyword.trim()
    const requestSequence = ownerSearchRequestSequenceRef.current + 1
    ownerSearchRequestSequenceRef.current = requestSequence
    setIsSearchingOwners(true)

    try {
      const owners = await searchProjectOwners({
        keyword: normalizedKeyword,
        page: 0,
        size: 10,
      })

      if (requestSequence !== ownerSearchRequestSequenceRef.current) {
        return
      }

      setProjectOwnerOptions(owners)
    } catch {
      if (requestSequence !== ownerSearchRequestSequenceRef.current) {
        return
      }

      setProjectOwnerOptions([])
    } finally {
      if (requestSequence === ownerSearchRequestSequenceRef.current) {
        setIsSearchingOwners(false)
      }
    }
  }, [])

  const handleOpenAddProjectMemberModal = (project: IProjectRecord) => {
    setSelectedProjectForMember(project)
    setProjectMemberUserOptions([])
    setIsAddProjectMemberModalOpen(true)
  }

  const handleCloseAddProjectMemberModal = () => {
    if (isSubmittingProjectMember) {
      return
    }

    setIsAddProjectMemberModalOpen(false)
    setSelectedProjectForMember(null)
  }

  const handleSearchProjectMemberUsers = useCallback(async (keyword: string) => {
    const normalizedKeyword = keyword.trim()
    const requestSequence = memberSearchRequestSequenceRef.current + 1
    memberSearchRequestSequenceRef.current = requestSequence
    setIsSearchingProjectMembers(true)

    try {
      const users = await searchProjectOwners({
        keyword: normalizedKeyword,
        page: 0,
        size: 10,
      })

      if (requestSequence !== memberSearchRequestSequenceRef.current) {
        return
      }

      setProjectMemberUserOptions(users)
    } catch {
      if (requestSequence !== memberSearchRequestSequenceRef.current) {
        return
      }

      setProjectMemberUserOptions([])
    } finally {
      if (requestSequence === memberSearchRequestSequenceRef.current) {
        setIsSearchingProjectMembers(false)
      }
    }
  }, [])

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
              aria-label="Close navigation"
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
            accountEmail="owner@workspace.arch"
            accountName="Tenant Owner"
            accountRole="Workspace Administrator"
            containerClassName="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur"
            innerClassName="px-4 py-3 md:px-6 xl:px-8"
            leadingContent={
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Sovereign Architect</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="truncate font-semibold text-slate-700">Tenant Admin</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="truncate font-semibold text-slate-700">{getSectionTitle(activeSection)}</span>
                </div>
                <h1 className="truncate text-3xl font-bold tracking-tight text-slate-950">{getSectionTitle(activeSection)}</h1>
              </div>
            }
            onMenuClick={() => setIsSidebarOpen(true)}
            searchPlaceholder="Search workspace resources..."
          />

          <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 xl:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-4xl text-sm leading-relaxed text-slate-600">{getSectionDescription(activeSection)}</p>

              <div className="flex items-center gap-2">
                {activeSection === "projects" && (
                  <>
                    <Button variant="outline" className="border-slate-300 bg-white">
                      Export Project Report
                    </Button>
                    <Button className="bg-cyan-700 text-white hover:bg-cyan-800" onClick={handleOpenCreateProjectModal}>
                      Add Project
                    </Button>
                  </>
                )}

                {activeSection === "security" && (
                  <Button className="bg-cyan-700 text-white hover:bg-cyan-800">Generate Security Snapshot</Button>
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
              isSearchingOwners={isSearchingOwners}
              owners={projectOwnerOptions}
              onSearchOwners={handleSearchProjectOwners}
              onClose={handleCloseCreateProjectModal}
              onSubmit={handleCreateProject}
            />

            <AddProjectMemberModal
              isOpen={isAddProjectMemberModalOpen}
              projectName={selectedProjectForMember?.name ?? ""}
              isSubmitting={isSubmittingProjectMember}
              isSearchingUsers={isSearchingProjectMembers}
              users={projectMemberUserOptions}
              onSearchUsers={handleSearchProjectMemberUsers}
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
