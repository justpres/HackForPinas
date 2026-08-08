export interface HackathonEvent {
  id: string
  title: string
  organizer_name: string
  description: string
  source_type: "facebook" | "official_site" | "community_submitted"
  redirect_url: string
  deadline: string
  region: string
  format: "online" | "in-person" | "hybrid"
  organizer_type: "government" | "university" | "private"
  is_government_verified: boolean
  poster_image_url: string | null
  last_checked_at: string
}

export type FilterRegion = string
export type FilterFormat = "all" | "online" | "in-person" | "hybrid"
export type FilterOrganizerType = "all" | "government" | "university" | "private"
export type FilterSort = "deadline" | "newest"

export interface FilterState {
  region: string
  format: FilterFormat
  organizer_type: FilterOrganizerType
  sort: FilterSort
  search: string
}
