// Filipino-themed prefixes (adjectives, foods, culture)
const PINOY_PREFIXES = [
  'Jeepney',
  'Adobo',
  'Sinigang',
  'Kape',
  'Salamat',
  'Taho',
  'Balut',
  'Pandesal',
  'Lodi',
  'Astig',
  'Sipag',
  'Bayani',
  'Makulay',
  'Kanin',
  'Biko',
  'HaloHalo',
  'Masaya',
  'Gising',
  'Matikas',
  'Matalino',
  'Lechon',
  'Sisig',
  'Kalesa',
  'Barangay'
];

// Developer and technology-themed suffixes
const TECH_SUFFIXES = [
  'Coder',
  'Byte',
  'Dev',
  'Query',
  'Script',
  'Array',
  'Loop',
  'Git',
  'Stack',
  'Prompt',
  'Pixel',
  'Hacker',
  'Compiler',
  'Node',
  'Bug',
  'Svelte',
  'React',
  'Python',
  'Next',
  'Tailwind',
  'Database',
  'Callback',
  'Deploy',
  'Binary'
];

// Vibrant Tailwind-like hex colors for avatars
const AVATAR_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#14B8A6'  // Teal
];

/**
 * Generates a random, creative Pinoy tech username.
 */
export function generateUsername(): string {
  const prefix = PINOY_PREFIXES[Math.floor(Math.random() * PINOY_PREFIXES.length)];
  const suffix = TECH_SUFFIXES[Math.floor(Math.random() * TECH_SUFFIXES.length)];
  return `${prefix}${suffix}`;
}

/**
 * Generates a random vibrant hex color.
 */
export function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/**
 * Gets initials from a username (e.g., "JeepneyCoder" -> "JC", "Adobo" -> "AD").
 */
export function getInitials(username: string): string {
  if (!username) return '??';
  
  // Find uppercase letters to get initials
  const uppercaseLetters = username.match(/[A-Z]/g);
  if (uppercaseLetters && uppercaseLetters.length >= 2) {
    return uppercaseLetters.slice(0, 2).join('');
  }
  
  // Fallback to first two letters
  return username.substring(0, 2).toUpperCase();
}

/**
 * Generates a stable, deterministic color index for a username.
 */
export function getDeterministicColor(username: string): string {
  if (!username) return '#3B82F6';
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
