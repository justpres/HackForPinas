import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  variant?: "compact" | "full"
  className?: string
}

export function VerifiedBadge({ variant = "compact", className }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[6px] bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground",
        className
      )}
      aria-label="Government Verified source"
    >
      <Icon icon="fluent:shield-checkmark-16-filled" width={14} aria-hidden="true" />
      {variant === "full" ? "Government Verified" : "Verified"}
    </span>
  )
}
