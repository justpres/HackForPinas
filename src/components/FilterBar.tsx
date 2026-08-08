import { Icon } from "@iconify/react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import type { FilterState } from "@/types/event"
import { REGIONS } from "@/data/events"
import { Input } from "@/components/ui/input"

interface FilterBarProps {
  filters: FilterState
  onChange: (next: Partial<FilterState>) => void
  resultCount: number
}

const FORMAT_OPTIONS = [
  { value: "all", label: "All Formats" },
  { value: "online", label: "Online" },
  { value: "in-person", label: "In-Person" },
  { value: "hybrid", label: "Hybrid" },
]

const ORGANIZER_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "government", label: "Government" },
  { value: "university", label: "University" },
  { value: "private", label: "Private" },
]

const SORT_OPTIONS = [
  { value: "deadline", label: "Deadline Soonest" },
  { value: "newest", label: "Newest First" },
]

function SelectChip({
  value,
  options,
  onChange,
  label,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  label: string
}) {
  const isActive = value !== "all" && value !== "deadline"

  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={cn(
          "h-8 rounded-[6px] border border-input bg-background pl-3 pr-7 text-xs font-medium appearance-none cursor-pointer",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-colors",
          isActive
            ? "border-primary/40 bg-accent text-accent-foreground"
            : "text-foreground hover:bg-muted"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Icon
        icon="fluent:chevron-down-16-regular"
        width={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
}

export function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const regionOptions = [
    { value: "all", label: "All Regions" },
    ...REGIONS.map((r) => ({ value: r, label: r })),
  ]

  const hasActiveFilters =
    filters.region !== "all" ||
    filters.format !== "all" ||
    filters.organizer_type !== "all" ||
    filters.search !== ""

  function clearFilters() {
    onChange({ region: "all", format: "all", organizer_type: "all", search: "" })
  }

  const filterControls = (
    <div className="flex flex-wrap items-center gap-2">
      <SelectChip
        label="Filter by region"
        value={filters.region}
        options={regionOptions}
        onChange={(v) => onChange({ region: v })}
      />
      <SelectChip
        label="Filter by format"
        value={filters.format}
        options={FORMAT_OPTIONS}
        onChange={(v) => onChange({ format: v as FilterState["format"] })}
      />
      <SelectChip
        label="Filter by organizer type"
        value={filters.organizer_type}
        options={ORGANIZER_OPTIONS}
        onChange={(v) => onChange({ organizer_type: v as FilterState["organizer_type"] })}
      />
      <div className="w-px h-5 bg-border hidden sm:block" aria-hidden="true" />
      <SelectChip
        label="Sort events"
        value={filters.sort}
        options={SORT_OPTIONS}
        onChange={(v) => onChange({ sort: v as FilterState["sort"] })}
      />
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="h-8 rounded-[6px] px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Clear filters
        </button>
      )}
    </div>
  )

  return (
    <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
        {/* Desktop layout */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Icon
              icon="fluent:search-16-regular"
              width={16}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className="h-8 pl-8 text-xs rounded-[8px]"
              aria-label="Search events"
            />
          </div>
          {filterControls}
          <p className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
            {resultCount} event{resultCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Mobile layout */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="relative flex-1">
            <Icon
              icon="fluent:search-16-regular"
              width={16}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className="h-8 pl-8 text-xs rounded-[8px]"
              aria-label="Search events"
            />
          </div>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-filters"
            className={cn(
              "flex h-8 items-center gap-1 rounded-[6px] border border-input px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              hasActiveFilters
                ? "border-primary/40 bg-accent text-accent-foreground"
                : "bg-background text-foreground hover:bg-muted"
            )}
          >
            <Icon icon="fluent:filter-16-regular" width={16} aria-hidden="true" />
            Filters
            {hasActiveFilters && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                {[filters.region !== "all", filters.format !== "all", filters.organizer_type !== "all"].filter(Boolean).length}
              </span>
            )}
          </button>
          <p className="shrink-0 text-xs text-muted-foreground">{resultCount}</p>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="sm:hidden overflow-hidden"
            >
              <div className="pt-3 pb-1">
                {filterControls}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
