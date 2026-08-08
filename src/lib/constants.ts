/**
 * Philippine Regions list used throughout the application.
 */
export const REGIONS = [
  'NCR',
  'CAR',
  'Region I (Ilocos)',
  'Region II (Cagayan Valley)',
  'Region III (Central Luzon)',
  'Region IV-A (CALABARZON)',
  'Region IV-B (MIMAROPA)',
  'Region V (Bicol)',
  'Region VI (Western Visayas)',
  'Region VII (Central Visayas)',
  'Region VIII (Eastern Visayas)',
  'Region IX (Zamboanga Peninsula)',
  'Region X (Northern Mindanao)',
  'Region XI (Davao)',
  'Region XII (SOCCSKSARGEN)',
  'Region XIII (Caraga)',
  'BARMM',
  'Nationwide'
] as const;

export const FORMATS = ['online', 'in-person', 'hybrid'] as const;

export const ORGANIZER_TYPES = ['government', 'university', 'private'] as const;

export const SOURCE_TYPES = ['facebook', 'official_site', 'community_submitted'] as const;

export const STATUSES = ['pending_review', 'published', 'rejected', 'expired'] as const;

export const SORT_OPTIONS = [
  { value: 'deadline', label: 'Deadline Soonest' },
  { value: 'newest', label: 'Newest First' }
] as const;

/**
 * Allowed domains for open-redirect protection.
 */
export const ALLOWED_REDIRECT_DOMAINS = [
  'facebook.com',
  'fb.com',
  'fb.me',
  'm.facebook.com'
  // Note: domain regex patterns for .gov.ph, .edu.ph etc. are handled 
  // directly in the redirect validator logic for dynamic domains.
] as const;
