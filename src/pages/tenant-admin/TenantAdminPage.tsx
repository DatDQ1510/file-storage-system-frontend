import { useCallback, useState } from "react"
import {
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/common/Header"
import { Button } from "@/components/ui/button"
import { DashboardSection } from "@/pages/tenant-admin/components/sections/DashboardSection"
import { OrganizationSection } from "@/pages/tenant-admin/components/sections/OrganizationSection"
import { ProjectsSection } from "@/pages/tenant-admin/components/sections/ProjectsSection"
import { CreateProjectModal } from "@/pages/tenant-admin/components/sections/projects/CreateProjectModal"
import { SecuritySection } from "@/pages/tenant-admin/components/sections/SecuritySection"
import { TenantSidebar } from "@/pages/tenant-admin/components/TenantSidebar"
import {
  PROJECT_RECORDS,
  getSectionDescription,
  getSectionTitle,
} from "@/pages/tenant-admin/constants"
import {
  createProject,
  searchProjectOwners,
} from "@/pages/tenant-admin/services/project-service"
import type {
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
  ownerName: string,
  fallbackId: string
): IProjectRecord => {
  const status = mapProjectStatus(project.status)

  return {
    id: project.id?.trim() ? project.id : fallbackId,
    name: project.nameProject?.trim() ? project.nameProject : "Untitled Project",
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
  const [activeSection, setActiveSection] = useState<TTenantAdminSection>("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projectRecords, setProjectRecords] = useState<IProjectRecord[]>(PROJECT_RECORDS)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [projectOwnerOptions, setProjectOwnerOptions] = useState<IProjectOwnerOption[]>(PROJECT_OWNER_OPTIONS)
  const [isSearchingOwners, setIsSearchingOwners] = useState(false)

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
        mapCreatedProjectToRecord(createdProject, ownerName, fallbackId),
        ...current,
      ])

      setIsCreateProjectModalOpen(false)
      toast.success("Tạo dự án thành công")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo dự án")
    } finally {
      setIsSubmittingProject(false)
    }
  }

  const handleSearchProjectOwners = useCallback(async (keyword: string) => {
    const normalizedKeyword = keyword.trim()
    setIsSearchingOwners(true)

    try {
      const owners = await searchProjectOwners({
        keyword: normalizedKeyword,
        page: 0,
        size: 10,
      })
      setProjectOwnerOptions(owners)
    } catch {
      setProjectOwnerOptions([])
    } finally {
      setIsSearchingOwners(false)
    }
  }, [])

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
            {activeSection === "projects" && <ProjectsSection projectRecords={projectRecords} />}
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

          </main>
        </div>
      </div>
      <div className="admin-shell-gradient pointer-events-none fixed inset-0 -z-10" />
    </div>
  )
}
