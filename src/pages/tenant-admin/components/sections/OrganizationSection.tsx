import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Copy,
  Mail,
  Plus,
  Search,
  Upload,
  UserCheck,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateUserModal } from "@/pages/tenant-admin/components/sections/organization/CreateUserModal"
import {
  createTenantUser,
  loadUserDirectoryPage,
} from "@/pages/tenant-admin/services/user-service"
import type {
  ICreateTenantUserRequest,
  IUserDirectoryRecord,
  TTenantUserStatus,
} from "@/pages/tenant-admin/types"
import { cn } from "@/lib/utils"

type TMemberStatus = TTenantUserStatus

const MEMBER_DIRECTORY: IUserDirectoryRecord[] = [
  {
    id: "usr-001",
    fullName: "Liam Chen",
    email: "liam.chen@tenant.io",
    phone: "+84 901 122 334",
    employeeCode: "EMP-1001",
    department: "Engineering",
    status: "Active",
    joinedAt: "2025-08-11",
    mfaEnabled: true,
    storageUsed: "13.2 GB",
  },
  {
    id: "usr-002",
    fullName: "Ava Brooks",
    email: "ava.brooks@tenant.io",
    phone: "+84 906 300 420",
    employeeCode: "EMP-1002",
    department: "Engineering",
    status: "Active",
    joinedAt: "2025-11-22",
    mfaEnabled: true,
    storageUsed: "8.9 GB",
  },
  {
    id: "usr-003",
    fullName: "Noah Patel",
    email: "noah.patel@tenant.io",
    phone: "+84 978 130 098",
    employeeCode: "EMP-1021",
    department: "Marketing",
    status: "Active",
    joinedAt: "2025-07-03",
    mfaEnabled: true,
    storageUsed: "4.1 GB",
  },
  {
    id: "usr-004",
    fullName: "Mia Walker",
    email: "mia.walker@tenant.io",
    phone: "+84 933 223 711",
    employeeCode: "EMP-1044",
    department: "Operations",
    status: "Pending",
    joinedAt: "2026-03-27",
    mfaEnabled: false,
    storageUsed: "0.0 GB",
  },
  {
    id: "usr-005",
    fullName: "Ethan Moore",
    email: "ethan.moore@tenant.io",
    phone: "+84 983 551 345",
    employeeCode: "EMP-1080",
    department: "Finance",
    status: "Suspended",
    joinedAt: "2024-12-09",
    mfaEnabled: false,
    storageUsed: "1.8 GB",
  },
]


const STATUS_OPTIONS: Array<TMemberStatus | "all"> = [
  "all",
  "Active",
  "Pending",
  "Suspended",
]

const getMemberStatusLabel = (status: TMemberStatus | "all") => {
  if (status === "all") {
    return "Tất cả trạng thái"
  }
  if (status === "Active") {
    return "Đang hoạt động"
  }
  if (status === "Pending") {
    return "Chờ kích hoạt"
  }
  return "Tạm khóa"
}

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

interface IMemberRowActionsMenuProps {
  member: IUserDirectoryRecord
  onToggleStatus: (memberId: string, nextStatus: TMemberStatus) => void
}

const MemberRowActionsMenu = ({ member, onToggleStatus }: IMemberRowActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(`[data-member-actions="${member.id}"]`)) {
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
  }, [isOpen, member.id])

  const handleCopyValue = async (value: string, label: string) => {
    const copied = await copyTextToClipboard(value)

    if (copied) {
      toast.success(`Đã sao chép ${label}`)
    } else {
      toast.error("Không thể sao chép vào bộ nhớ tạm")
    }

    setIsOpen(false)
  }

  const handleOpenEmail = () => {
    if (!member.email.trim()) {
      toast.error("Không có email của thành viên")
      return
    }

    window.location.href = `mailto:${member.email}`
    setIsOpen(false)
  }

  const nextStatus: TMemberStatus = member.status === "Active" ? "Suspended" : "Active"

  return (
    <div className="relative inline-flex" data-member-actions={member.id} ref={menuRef}>
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
            onClick={handleOpenEmail}
            role="menuitem"
          >
            <Mail className="h-4 w-4" />
            Gửi email
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => void handleCopyValue(member.email, "email")}
            role="menuitem"
          >
            <Copy className="h-4 w-4" />
            Sao chép email
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              onToggleStatus(member.id, nextStatus)
              setIsOpen(false)
            }}
            role="menuitem"
          >
            <UserCheck className="h-4 w-4" />
            {nextStatus === "Active" ? "Bật user" : "Tắt user"}
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => void handleCopyValue(member.id, "mã thành viên")}
            role="menuitem"
          >
            <UserRound className="h-4 w-4" />
            Sao chép mã thành viên
          </button>
        </div>
      )}
    </div>
  )
}

export const OrganizationSection = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<TMemberStatus | "all">("all")
  const [members, setMembers] = useState<IUserDirectoryRecord[]>(MEMBER_DIRECTORY)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [isUsingMockData, setIsUsingMockData] = useState(true)
  const [page, setPage] = useState(0)
  const [offset, setOffset] = useState(10)
  const [totalElements, setTotalElements] = useState(MEMBER_DIRECTORY.length)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [isSubmittingCreateUser, setIsSubmittingCreateUser] = useState(false)

  const mapMockMembersPage = useCallback(
    (nextPage: number, nextOffset: number) => {
      const total = MEMBER_DIRECTORY.length
      const computedTotalPages = Math.max(Math.ceil(total / nextOffset), 1)
      const boundedPage = Math.min(nextPage, computedTotalPages - 1)
      const startIndex = boundedPage * nextOffset
      const endIndex = startIndex + nextOffset

      setMembers(MEMBER_DIRECTORY.slice(startIndex, endIndex))
      setPage(boundedPage)
      setOffset(nextOffset)
      setTotalElements(total)
      setTotalPages(computedTotalPages)
      setHasNext(boundedPage < computedTotalPages - 1)
      setHasPrevious(boundedPage > 0)
      setIsUsingMockData(true)
    },
    []
  )

  const loadMembers = useCallback(async () => {
    setIsLoadingMembers(true)

    try {
      const memberPage = await loadUserDirectoryPage({ page, offset })

      setMembers(memberPage.items)
      setPage(memberPage.page)
      setOffset(memberPage.offset)
      setTotalElements(memberPage.totalElements)
      setTotalPages(Math.max(memberPage.totalPages, 1))
      setHasNext(memberPage.hasNext)
      setHasPrevious(memberPage.hasPrevious)
      setIsUsingMockData(false)
    } catch {
      mapMockMembersPage(page, offset)
      toast.error("Không tải được danh sách người dùng từ API. Đang hiển thị dữ liệu mẫu.")
    } finally {
      setIsLoadingMembers(false)
    }
  }, [mapMockMembersPage, offset, page])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const normalizedSearch = searchTerm.trim().toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 ||
        member.fullName.toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch) ||
        member.employeeCode.toLowerCase().includes(normalizedSearch)
      const matchesStatus = selectedStatus === "all" || member.status === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [members, searchTerm, selectedStatus])

  const summaryCards = useMemo(() => {
    const activeAccounts = members.filter((member) => member.status === "Active").length
    const mfaEnabledAccounts = members.filter((member) => member.mfaEnabled).length
    const suspendedAccounts = members.filter((member) => member.status === "Suspended").length

    return [
      {
        label: "Tổng thành viên",
        value: `${totalElements}`,
        note: "Toàn bộ thư mục tenant",
      },
      {
        label: "Tài khoản đang hoạt động",
        value: `${activeAccounts}`,
        note: "Trong trang hiện tại",
      },
      {
        label: "Đã bật MFA",
        value: `${mfaEnabledAccounts}`,
        note: "Trong trang hiện tại",
      },
      {
        label: "Tạm khóa",
        value: `${suspendedAccounts}`,
        note: "Trong trang hiện tại",
      },
    ]
  }, [members, totalElements])

  const handleOpenCreateUserModal = () => {
    setIsCreateUserModalOpen(true)
  }

  const handleToggleMemberStatus = useCallback((memberId: string, nextStatus: TMemberStatus) => {
    setMembers((current) =>
      current.map((member) =>
        member.id === memberId
          ? {
              ...member,
              status: nextStatus,
            }
          : member
      )
    )

    toast.success(nextStatus === "Active" ? "Người dùng đã được bật" : "Người dùng đã được tắt")
  }, [])

  const handleCloseCreateUserModal = () => {
    if (isSubmittingCreateUser) {
      return
    }

    setIsCreateUserModalOpen(false)
  }

  const handleCreateUser = async (input: ICreateTenantUserRequest) => {
    setIsSubmittingCreateUser(true)

    try {
      const createdUser = await createTenantUser(input)
      const nextIndex = members.length + 1
      const generatedId = `usr-${String(nextIndex).padStart(3, "0")}`
      const joinedAt = new Date().toISOString().slice(0, 10)

      setMembers((current) => [
        {
          id: createdUser.id?.trim() ? createdUser.id : generatedId,
          fullName: createdUser.userName?.trim() ? createdUser.userName : input.userName,
          email: createdUser.email?.trim() ? createdUser.email : input.email,
          phone: createdUser.phoneNumber?.trim() ? createdUser.phoneNumber : input.phoneNumber || "Không có",
          employeeCode: `EMP-${1000 + nextIndex}`,
          department:
            createdUser.department?.trim() || input.department.trim() || "Chung",
          status: "Pending",
          joinedAt,
          mfaEnabled: false,
          storageUsed: "0.0 GB",
        },
        ...current,
      ])

      setIsCreateUserModalOpen(false)
      toast.success("Tạo người dùng thành công")
      setTotalElements((current) => current + 1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo người dùng")
    } finally {
      setIsSubmittingCreateUser(false)
    }
  }

  const handleOffsetChange = (nextOffset: number) => {
    if (!Number.isFinite(nextOffset) || nextOffset <= 0) {
      return
    }

    setOffset(nextOffset)
    setPage(0)
  }

  const handlePreviousPage = () => {
    if (!hasPrevious || isLoadingMembers) {
      return
    }

    setPage((current) => Math.max(current - 1, 0))
  }

  const handleNextPage = () => {
    if (!hasNext || isLoadingMembers) {
      return
    }

    setPage((current) => current + 1)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Member Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý tập trung danh bạ thành viên với thông tin định danh, trạng thái truy cập và hiển thị bảo mật.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 bg-white"
            onClick={() => toast.info("Tính năng nhập hàng loạt sẽ được triển khai ở bước tiếp theo.")}
          >
            <Upload className="h-4 w-4" />
            Thêm người dùng hàng loạt
          </Button>
          <Button
            size="sm"
            className="bg-cyan-700 text-white hover:bg-cyan-800"
            onClick={handleOpenCreateUserModal}
          >
            <Plus className="h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-slate-200 bg-white/90 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Danh bạ thành viên</CardTitle>
            {isUsingMockData && (
              <p className="text-xs font-medium text-amber-600">
                API không khả dụng - đang hiển thị dữ liệu mẫu.
              </p>
            )}
          </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-[1.3fr_0.7fr_0.7fr_auto]">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Tìm theo tên, email hoặc mã nhân viên"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
              onChange={(event) => setSelectedStatus(event.target.value as TMemberStatus | "all")}
              value={selectedStatus}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getMemberStatusLabel(status)}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="outline"
              className="border-slate-300"
              onClick={() => {
                setSearchTerm("")
                setSelectedStatus("all")
                setPage(0)
              }}
            >
              Đặt lại bộ lọc
            </Button>

            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
              onChange={(event) => handleOffsetChange(Number(event.target.value))}
              value={offset}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>

          <div className="rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    <th className="px-3 py-2.5">Thành viên</th>
                    <th className="px-3 py-2.5">Liên hệ</th>
                    <th className="px-3 py-2.5">Phòng ban</th>
                    <th className="px-3 py-2.5">Trạng thái</th>
                    <th className="px-3 py-2.5">MFA</th>
                    <th className="px-3 py-2.5">Lưu trữ</th>
                    <th className="px-3 py-2.5">Ngày tham gia</th>
                    <th className="px-3 py-2.5 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoadingMembers ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-500">
                        Đang tải người dùng...
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-500">
                        Không tìm thấy người dùng.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="border-b border-slate-100 last:border-none">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-900">{member.fullName}</p>
                          <p className="text-xs text-slate-500">{member.employeeCode}</p>
                        </td>

                        <td className="px-3 py-3">
                          <p className="text-slate-700">{member.email}</p>
                          <p className="text-xs text-slate-500">{member.phone}</p>
                        </td>

                        <td className="px-3 py-3 text-slate-700">{member.department}</td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
                              member.status === "Active" && "bg-emerald-100 text-emerald-700",
                              member.status === "Pending" && "bg-amber-100 text-amber-700",
                              member.status === "Suspended" && "bg-red-100 text-red-700"
                            )}
                          >
                            {getMemberStatusLabel(member.status)}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
                              member.mfaEnabled
                                ? "bg-cyan-100 text-cyan-700"
                                : "bg-slate-100 text-slate-600"
                            )}
                            >
                            <UserCheck className="h-3.5 w-3.5" />
                            {member.mfaEnabled ? "Đã bật" : "Đã tắt"}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-slate-700">{member.storageUsed}</td>
                        <td className="px-3 py-3 text-slate-700">{member.joinedAt}</td>

                        <td className="px-3 py-3 text-right">
                          <MemberRowActionsMenu member={member} onToggleStatus={handleToggleMemberStatus} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tổng bản ghi: {totalElements}</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePreviousPage}
                disabled={!hasPrevious || isLoadingMembers}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <span>
                Trang {page + 1}/{totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNextPage}
                disabled={!hasNext || isLoadingMembers}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        isSubmitting={isSubmittingCreateUser}
        onClose={handleCloseCreateUserModal}
        onSubmit={handleCreateUser}
      />
    </div>
  )
}
