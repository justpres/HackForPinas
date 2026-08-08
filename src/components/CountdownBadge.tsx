import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { getDeadlineLabel, getDeadlineUrgency } from "@/lib/deadline"

interface CountdownBadgeProps {
  deadline: string
  className?: string
}

export function CountdownBadge({ deadline, className }: CountdownBadgeProps) {
  const urgency = getDeadlineUrgency(deadline)
  const label = getDeadlineLabel(deadline)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-xs font-medium",
        urgency === "neutral" && "bg-secondary text-secondary-foreground",
        urgency === "amber" && "bg-amber/20 text-amber-foreground",
        urgency === "urgent" && "bg-urgent/15 text-urgent",
        className
      )}
      aria-label={`Deadline: ${label}`}
    >
      <Icon icon="fluent:calendar-16-regular" width={14} aria-hidden="true" />
      {label}
    </span>
  )
}
