import { EventCard } from "./EventCard"
import type { HackathonEvent } from "@/types/event"

export function EventCardSkeleton() {
  return (
    <div className="rounded-[10px] bg-card shadow-resting overflow-hidden animate-pulse">
      <div className="aspect-[16/7] w-full bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-24 rounded-[6px] bg-muted" />
        <div className="h-4 w-full rounded-[6px] bg-muted" />
        <div className="h-4 w-3/4 rounded-[6px] bg-muted" />
        <div className="flex gap-1.5">
          <div className="h-5 w-20 rounded-[6px] bg-muted" />
          <div className="h-5 w-16 rounded-[6px] bg-muted" />
        </div>
      </div>
    </div>
  )
}

interface EventGridProps {
  events: HackathonEvent[]
  isLoading?: boolean
}

export function EventGrid({ events, isLoading }: EventGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading events">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return <EventsEmptyState />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

function EventsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-muted mb-4">
        {/* lazy import to keep chunk small */}
        <svg
          aria-hidden="true"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-foreground">No events found</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Try adjusting your filters or check back soon for new events.
      </p>
    </div>
  )
}
