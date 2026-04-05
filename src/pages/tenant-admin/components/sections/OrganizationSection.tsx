import { useMemo, useState } from "react"
import { Ellipsis, Plus, Search, Upload, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type TMemberRole = "Workspace Admin" | "Project Manager" | "Contributor" | "Viewer"
type TMemberStatus = "Active" | "Pending" | "Suspended"

type TActionMode = "single" | "batch" | null

interface IMemberDirectoryRecord {
  id: string
  fullName: string
  email: string
  phone: string
  employeeCode: string
  department: string
  role: TMemberRole
  status: TMemberStatus
  joinedAt: string
  lastActive: string
  mfaEnabled: boolean
  storageUsed: string
}

const MEMBER_DIRECTORY: IMemberDirectoryRecord[] = [
  {
    id: "usr-001",
    fullName: "Liam Chen",
    email: "liam.chen@tenant.io",
    phone: "+84 901 122 334",
    employeeCode: "EMP-1001",
    department: "Engineering",
    role: "Workspace Admin",
    status: "Active",
    joinedAt: "2025-08-11",
    lastActive: "2m ago",
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
    role: "Contributor",
    status: "Active",
    joinedAt: "2025-11-22",
    lastActive: "17m ago",
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
    role: "Project Manager",
    status: "Active",
    joinedAt: "2025-07-03",
    lastActive: "1h ago",
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
    role: "Contributor",
    status: "Pending",
    joinedAt: "2026-03-27",
    lastActive: "Never",
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
    role: "Viewer",
    status: "Suspended",
    joinedAt: "2024-12-09",
    lastActive: "5d ago",
    mfaEnabled: false,
    storageUsed: "1.8 GB",
  },
]

const ROLE_OPTIONS: Array<TMemberRole | "all"> = [
  "all",
  "Workspace Admin",
  "Project Manager",
  "Contributor",
  "Viewer",
]

const STATUS_OPTIONS: Array<TMemberStatus | "all"> = [
  "all",
  "Active",
  "Pending",
  "Suspended",
]

const SUMMARY_CARDS = [
  { label: "Total Members", value: "125", note: "Across all departments" },
  { label: "Active Accounts", value: "112", note: "Currently enabled users" },
  { label: "Pending Invites", value: "7", note: "Waiting for acceptance" },
  { label: "MFA Enabled", value: "104", note: "Protected accounts" },
]

export const OrganizationSection = () => {
  const [actionMode, setActionMode] = useState<TActionMode>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<TMemberRole | "all">("all")
  const [selectedStatus, setSelectedStatus] = useState<TMemberStatus | "all">("all")

  const filteredMembers = useMemo(() => {
    return MEMBER_DIRECTORY.filter((member) => {
      const normalizedSearch = searchTerm.trim().toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 ||
        member.fullName.toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch) ||
        member.employeeCode.toLowerCase().includes(normalizedSearch)
      const matchesRole = selectedRole === "all" || member.role === selectedRole
      const matchesStatus = selectedStatus === "all" || member.status === selectedStatus

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [searchTerm, selectedRole, selectedStatus])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Member Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Centralized member directory with richer identity fields, access status, and security visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 bg-white"
            onClick={() => setActionMode("batch")}
          >
            <Upload className="h-4 w-4" />
            Add Users by Batch
          </Button>
          <Button
            size="sm"
            className="bg-cyan-700 text-white hover:bg-cyan-800"
            onClick={() => setActionMode("single")}
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
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
          <CardTitle className="text-xl font-semibold text-slate-900">Member Directory</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-[1.3fr_0.7fr_0.7fr_auto]">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search by name, email, or employee code"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
              onChange={(event) => setSelectedRole(event.target.value as TMemberRole | "all")}
              value={selectedRole}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role === "all" ? "All Roles" : role}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
              onChange={(event) => setSelectedStatus(event.target.value as TMemberStatus | "all")}
              value={selectedStatus}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All Statuses" : status}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="outline"
              className="border-slate-300"
              onClick={() => {
                setSearchTerm("")
                setSelectedRole("all")
                setSelectedStatus("all")
              }}
            >
              Reset Filters
            </Button>
          </div>

          {actionMode === "single" && (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2.5">
              <p className="text-sm font-semibold text-cyan-900">Add User Flow</p>
              <p className="text-xs text-cyan-800">
                Create one account with full identity fields: full name, corporate email, phone, employee code, department, and role.
              </p>
            </div>
          )}

          {actionMode === "batch" && (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2.5">
              <p className="text-sm font-semibold text-cyan-900">Batch Import Flow</p>
              <p className="text-xs text-cyan-800">
                Upload CSV with columns: fullName, email, phone, employeeCode, department, role, status. System validates duplicates first.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    <th className="px-3 py-2.5">Member</th>
                    <th className="px-3 py-2.5">Contact</th>
                    <th className="px-3 py-2.5">Department</th>
                    <th className="px-3 py-2.5">Role</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">MFA</th>
                    <th className="px-3 py-2.5">Storage</th>
                    <th className="px-3 py-2.5">Last Active</th>
                    <th className="px-3 py-2.5">Joined</th>
                    <th className="px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMembers.map((member) => (
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
                      <td className="px-3 py-3 text-slate-700">{member.role}</td>

                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
                            member.status === "Active" && "bg-emerald-100 text-emerald-700",
                            member.status === "Pending" && "bg-amber-100 text-amber-700",
                            member.status === "Suspended" && "bg-red-100 text-red-700"
                          )}
                        >
                          {member.status}
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
                          {member.mfaEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-slate-700">{member.storageUsed}</td>
                      <td className="px-3 py-3 text-slate-700">{member.lastActive}</td>
                      <td className="px-3 py-3 text-slate-700">{member.joinedAt}</td>

                      <td className="px-3 py-3 text-right">
                        <Button size="icon-sm" variant="ghost" className="text-slate-500">
                          <Ellipsis className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total records: {filteredMembers.length}</span>
            <span>Showing expanded member profile fields for faster admin reviews.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
