export interface Organizer {
  id: string;
  name: string;
  organizer_type: 'government' | 'university' | 'private';
  is_verified: boolean;
  facebook_page_id: string | null;
  official_website: string | null;
  created_at: string;
}

export interface Hackathon {
  id: string;
  title: string;
  organizer_id: string;
  description: string;
  source_type: 'facebook' | 'official_site' | 'community_submitted';
  source_url: string;
  redirect_url: string;
  deadline: string;
  event_start: string | null;
  event_end: string | null;
  region: string;
  format: 'online' | 'in-person' | 'hybrid';
  status: 'pending_review' | 'published' | 'rejected' | 'expired';
  poster_image_url: string | null;
  last_checked_at: string;
  submitted_by_email: string | null;
  created_at: string;
}

export interface HackathonWithOrganizer extends Hackathon {
  organizer: Organizer | null;
}

export interface SubmissionAuditLog {
  id: string;
  hackathon_id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'edited' | 'expired';
  actor: string | null;
  notes: string | null;
  created_at: string;
}

export interface FilterState {
  region: string;
  format: string;
  organizer_type: string;
  sort: 'deadline' | 'newest';
  search: string;
}
