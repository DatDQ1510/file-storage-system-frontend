import type { FormEvent } from "react"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IProfileDetailsFormProps {
  username: string
  emailAddress: string
  isSavingProfile: boolean
  onUsernameChange: (value: string) => void
  onEmailAddressChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const ProfileDetailsForm = ({
  username,
  emailAddress,
  isSavingProfile,
  onUsernameChange,
  onEmailAddressChange,
  onSubmit,
}: IProfileDetailsFormProps) => {
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Username</span>
        <input
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
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