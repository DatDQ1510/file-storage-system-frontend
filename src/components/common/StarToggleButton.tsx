import { Star } from "lucide-react"

interface IStarToggleButtonProps {
  isStarred: boolean
  isLoading?: boolean
  onClick: () => void | Promise<void>
  title?: string
  stopPropagation?: boolean
}

export const StarToggleButton = ({
  isStarred,
  isLoading = false,
  onClick,
  title,
  stopPropagation = true,
}: IStarToggleButtonProps) => {
  return (
    <button
      type="button"
      onClick={(event) => {
        if (stopPropagation) {
          event.stopPropagation()
        }

        void onClick()
      }}
      disabled={isLoading}
      title={title ?? (isStarred ? "Unstar" : "Star")}
      aria-label={title ?? (isStarred ? "Unstar" : "Star")}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-amber-300 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Star className={`h-4 w-4 ${isStarred ? "fill-amber-500 text-amber-500" : ""}`} />
    </button>
  )
}