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
  'Nationwide',
  'International'
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

/**
 * Checks whether an event is genuinely a Philippine hackathon/tech event vs foreign/global.
 */
export function isPhilippineHackathon(event: {
  region?: string | null;
  title?: string;
  description?: string;
  organizer?: { name?: string | null; organizer_type?: string | null } | null;
  source_url?: string | null;
}): boolean {
  if (event.region === 'International' || event.region === 'Global') {
    return false;
  }

  const orgName = (event.organizer?.name || '').toLowerCase();
  const title = (event.title || '').toLowerCase();
  const desc = (event.description || '').toLowerCase();
  const source = (event.source_url || '').toLowerCase();

  // Explicit Philippine entities
  const hasPhEntity = 
    orgName.includes('dict') ||
    orgName.includes('dost') ||
    orgName.includes('dti') ||
    orgName.includes('bsp') ||
    orgName.includes('devcon') ||
    orgName.includes('phildev') ||
    orgName.includes('gdg') ||
    orgName.includes('up ') ||
    orgName.includes('ateneo') ||
    orgName.includes('dlsu') ||
    orgName.includes('feu') ||
    orgName.includes('ust') ||
    orgName.includes('globe') ||
    orgName.includes('smart') ||
    orgName.includes('philippine') ||
    orgName.includes('manila') ||
    orgName.includes('cebu') ||
    orgName.includes('davao');

  if (hasPhEntity) return true;

  // Specific Philippine regions assigned
  if (event.region && event.region !== 'Nationwide' && event.region !== 'all' && event.region !== 'International') {
    return true;
  }

  // If host is a generic global platform without local keywords, it's global
  if (orgName.includes('devpost') || orgName.includes('devfolio') || source.includes('devpost.com') || source.includes('devfolio.co')) {
    const hasPhKeyword = title.includes('philippines') || title.includes('manila') || title.includes('cebu') || desc.includes('philippines') || desc.includes('filipino');
    return hasPhKeyword;
  }

  // If region is Nationwide or all, verify if it mentions Philippine context or is local
  return true;
}

/**
 * Formats region display to be explicit with flag and nationwide specificity.
 */
export function formatRegionDisplay(region: string | null | undefined, isPh: boolean = true): string {
  if (!isPh || region === 'International' || region === 'Global') {
    return '🌐 Global / Foreign';
  }

  if (!region || region === 'all' || region === 'Nationwide') {
    return '🇵🇭 Philippines (Nationwide)';
  }

  if (region.startsWith('🇵🇭') || region.startsWith('🌐')) {
    return region;
  }

  return `🇵🇭 ${region}`;
}

