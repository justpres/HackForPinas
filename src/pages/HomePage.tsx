import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { MOCK_EVENTS } from "@/data/events"
import { EventGrid } from "@/components/EventGrid"
import { FilterBar } from "@/components/FilterBar"
import type { FilterState } from "@/types/event"
import { isAfter } from "date-fns"

const DEFAULT_FILTERS: FilterState = {
  region: "all",
  format: "all",
  organizer_type: "all",
  sort: "deadline",
  search: "",
}

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  function updateFilters(next: Partial<FilterState>) {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  const filtered = useMemo(() => {
    let result = [...MOCK_EVENTS]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.organizer_name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      )
    }

    if (filters.region !== "all") {
      result = result.filter((e) => e.region === filters.region || e.region === "Nationwide")
    }

    if (filters.format !== "all") {
      result = result.filter((e) => e.format === filters.format)
    }

    if (filters.organizer_type !== "all") {
      result = result.filter((e) => e.organizer_type === filters.organizer_type)
    }

    if (filters.sort === "deadline") {
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    } else {
      result.sort((a, b) => new Date(b.last_checked_at).getTime() - new Date(a.last_checked_at).getTime())
    }

    return result
  }, [filters])

  const openCount = MOCK_EVENTS.filter((e) => isAfter(new Date(e.deadline), new Date())).length

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-background">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Philippine Tech Events
          </p>
          <h1 className="text-[32px] font-bold text-foreground leading-tight max-w-xl mb-4">
            Every Philippine hackathon,<br className="hidden sm:block" /> one place.
          </h1>
          <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
            HackForPinas aggregates hackathons and tech competitions from government agencies, universities,
            and private organizers across the Philippines — so you spend less time searching and more time building.
          </p>
          <div className="mt-6 flex items-center gap-6">
            <div>
              <p className="text-[20px] font-bold text-foreground">{openCount}</p>
              <p className="text-xs text-muted-foreground">open events</p>
            </div>
            <div className="w-px h-8 bg-border" aria-hidden="true" />
            <div>
              <p className="text-[20px] font-bold text-foreground">{MOCK_EVENTS.length}</p>
              <p className="text-xs text-muted-foreground">events listed</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Filter bar */}
      <FilterBar filters={filters} onChange={updateFilters} resultCount={filtered.length} />

      {/* Grid */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <EventGrid events={filtered} />
      </main>
    </div>
  )
}
