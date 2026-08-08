import { useParams, Link } from "react-router-dom"
import { Icon } from "@iconify/react"
import { motion } from "motion/react"
import { format } from "date-fns"
import { MOCK_EVENTS } from "@/data/events"
import { CountdownBadge } from "@/components/CountdownBadge"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import NotFoundPage from "./NotFoundPage"

const FORMAT_LABELS: Record<string, string> = {
  online: "Online",
  "in-person": "In-Person",
  hybrid: "Hybrid",
}

const ORGANIZER_LABELS: Record<string, string> = {
  government: "Government",
  university: "University",
  private: "Private",
}

const SOURCE_LABELS: Record<string, string> = {
  facebook: "Facebook",
  official_site: "Official Site",
  community_submitted: "Community Submission",
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const event = MOCK_EVENTS.find((e) => e.id === id)

  if (!event) return <NotFoundPage />

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link
              to="/"
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Events
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon icon="fluent:chevron-right-16-regular" width={14} />
          </li>
          <li className="text-foreground font-medium truncate max-w-xs">{event.title}</li>
        </ol>
      </nav>

      {/* Thumbnail / color block */}
      <div className="aspect-[21/7] w-full rounded-[10px] overflow-hidden mb-6 shadow-resting">
        {event.poster_image_url ? (
          <img
            src={event.poster_image_url}
            alt={`Poster for ${event.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${
              event.organizer_type === "government"
                ? "bg-accent"
                : event.organizer_type === "university"
                ? "bg-secondary"
                : "bg-muted"
            }`}
          >
            <span className="text-3xl font-bold tracking-widest opacity-30 select-none uppercase">
              {event.organizer_name
                .split(" ")
                .slice(0, 3)
                .map((w) => w[0])
                .join("")}
            </span>
          </div>
        )}
      </div>

      {/* Top badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <CountdownBadge deadline={event.deadline} />
        {event.is_government_verified && <VerifiedBadge variant="full" />}
      </div>

      {/* Title */}
      <h1 className="text-[24px] font-bold text-foreground leading-tight mb-2">
        {event.title}
      </h1>
      <p className="text-sm text-muted-foreground mb-6 font-medium">{event.organizer_name}</p>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-5 mb-5 border-b border-border">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon icon="fluent:location-16-regular" width={16} aria-hidden="true" />
          {event.region}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon icon="fluent:building-16-regular" width={16} aria-hidden="true" />
          {ORGANIZER_LABELS[event.organizer_type]}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon icon="fluent:calendar-16-regular" width={16} aria-hidden="true" />
          Deadline: {format(new Date(event.deadline), "MMMM d, yyyy")}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {FORMAT_LABELS[event.format]}
        </span>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">About this event</h2>
        <p className="text-[14px] text-foreground/80 leading-relaxed">{event.description}</p>
      </div>

      {/* CTA */}
      <a
        href={event.redirect_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-[8px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-resting transition-all duration-150 hover:opacity-90 hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {event.source_type === "facebook" ? "View Original Post" : "Register Now"}
        <Icon icon="fluent:open-16-regular" width={16} aria-hidden="true" />
      </a>

      {/* Source attribution */}
      <p className="mt-4 text-xs text-muted-foreground">
        Sourced from {SOURCE_LABELS[event.source_type]}
        {" · "}Last verified {format(new Date(event.last_checked_at), "MMMM d, yyyy")}
      </p>
    </motion.main>
  )
}
