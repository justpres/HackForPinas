import { differenceInDays, differenceInHours, isAfter } from "date-fns"

export function getDeadlineUrgency(deadline: string): "neutral" | "amber" | "urgent" {
  const now = new Date()
  const end = new Date(deadline)
  if (!isAfter(end, now)) return "urgent"
  const hours = differenceInHours(end, now)
  if (hours <= 48) return "urgent"
  const days = differenceInDays(end, now)
  if (days <= 7) return "amber"
  return "neutral"
}

export function getDeadlineLabel(deadline: string): string {
  const now = new Date()
  const end = new Date(deadline)
  if (!isAfter(end, now)) return "Closed"
  const hours = differenceInHours(end, now)
  if (hours < 24) return "Closes today"
  if (hours < 48) return "Closes tomorrow"
  const days = differenceInDays(end, now)
  if (days === 1) return "1 day left"
  return `${days} days left`
}
