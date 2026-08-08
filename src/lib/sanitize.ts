/**
 * Removes all HTML tags from a string.
 * @param input - The string to strip HTML from.
 * @returns A string without HTML tags.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>?/gm, '');
}

/**
 * Strips HTML, trims whitespace, and normalizes multiple spaces.
 * @param input - The string to sanitize.
 * @returns A sanitized string.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  const stripped = stripHtml(input);
  return stripped.trim().replace(/\s\s+/g, ' ');
}

/**
 * Escapes characters that can be used in XSS attacks.
 * @param input - The string to escape.
 * @returns An escaped string.
 */
export function escapeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
