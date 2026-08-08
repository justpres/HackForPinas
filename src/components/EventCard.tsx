import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import type { HackathonEvent } from "@/types/event"
import { CountdownBadge } from "./CountdownBadge"
import { VerifiedBadge } from "./VerifiedBadge"

interface EventCardProps {
  event: HackathonEvent
  className?: string
}

const FORMAT_LABELS: Record<HackathonEvent["format"], string> = {
  online: "Online",
  "in-person": "In-Person",
  hybrid: "Hybrid",
}

const ORGANIZER_LABELS: Record<HackathonEvent["organizer_type"], string> = {
  government: "Government",
  university: "University",
  private: "Private",
}

const ORG_INITIALS: Record<HackathonEvent["organizer_type"], string> = {
  government: "GOV",
  university: "UNI",
  private: "PVT",
}

const COLOR_BLOCKS: Record<HackathonEvent["organizer_type"], string> = {
  government: "bg-accent text-accent-foreground",
  university: "bg-secondary text-secondary-foreground",
  private: "bg-muted text-muted-foreground",
}

export function EventCard({ event, className }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
      className={cn("group", className)}
    >
      <Link
        to={`/events/${event.id}`}
        className="block rounded-[10px] bg-card shadow-resting transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden hover:shadow-hover"
        aria-label={`View details for ${event.title}`}
      >
        {/* Thumbnail */}
        <div className="aspect-[16/7] w-full overflow-hidden">
          {event.poster_image_url ? (
            <img
              src={event.poster_image_url}
              alt={`Poster for ${event.title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center",
                COLOR_BLOCKS[event.organizer_type]
              )}
            >
              <span className="text-2xl font-bold tracking-widest opacity-40 select-none">
                {ORG_INITIALS[event.organizer_type]}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <CountdownBadge deadline={event.deadline} />
            {event.is_government_verified && <VerifiedBadge />}
          </div>

          {/* Title */}
          <h2 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-1">
            {event.title}
          </h2>

          {/* Organizer */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
            {event.organizer_name}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-[6px] bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Icon icon="fluent:location-16-regular" width={14} aria-hidden="true" />
              {event.region}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[6px] bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {FORMAT_LABELS[event.format]}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[6px] bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {ORGANIZER_LABELS[event.organizer_type]}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
