import type { FormEvent } from "react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IProfileDetailsFormProps {
  fullName: string
  emailAddress: string
  jobTitle: string
  department: string
  isSavingProfile: boolean
  onFullNameChange: (value: string) => void
  onEmailAddressChange: (value: string) => void
  onJobTitleChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const ProfileDetailsForm = ({
  fullName,
  emailAddress,
  jobTitle,
  department,
  isSavingProfile,
  onFullNameChange,
  onEmailAddressChange,
  onJobTitleChange,
  onDepartmentChange,
  onSubmit,
}: IProfileDetailsFormProps) => {
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Full Name</span>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
          value={fullName}
          onChange={(event) => onFullNameChange(event.target.value)}
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Email Address</span>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
          value={emailAddress}
          onChange={(event) => onEmailAddressChange(event.target.value)}
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Job Title</span>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
          value={jobTitle}
          onChange={(event) => onJobTitleChange(event.target.value)}
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Department</span>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
          value={department}
          onChange={(event) => onDepartmentChange(event.target.value)}
        />
      </label>
      <div className="md:col-span-2 flex justify-end pt-2">
        <Button type="submit" className="bg-blue-700 text-white hover:bg-blue-800" disabled={isSavingProfile}>
          {isSavingProfile ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Saving Changes
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}