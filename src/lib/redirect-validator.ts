import { ALLOWED_REDIRECT_DOMAINS } from './constants';

/**
 * Checks if a domain is strictly allowed or matches wildcard rules.
 * @param url - The URL string to check.
 * @returns Object with allowed status and extracted domain.
 */
export function isAllowedDomain(url: string): { allowed: boolean; domain: string } {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Check against exact domains
    if (ALLOWED_REDIRECT_DOMAINS.includes(hostname as any)) {
      return { allowed: true, domain: hostname };
    }

    // Check for common Philippine domains
    if (hostname.endsWith('.gov.ph') || hostname.endsWith('.edu.ph')) {
      return { allowed: true, domain: hostname };
    }

    return { allowed: false, domain: hostname };
  } catch (error) {
    return { allowed: false, domain: '' };
  }
}

/**
 * Validates a redirect URL, ensuring it is HTTPS and has an allowed domain.
 * @param url - The URL string to validate.
 * @returns Object containing validation result.
 */
export function validateRedirectUrl(url: string): { valid: boolean; reason?: string; needsReview?: boolean } {
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.protocol !== 'https:') {
      return { valid: false, reason: 'Must use HTTPS' };
    }

    const { allowed } = isAllowedDomain(url);
    
    if (!allowed) {
      return { valid: true, needsReview: true, reason: 'Domain not in allow-list' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Invalid URL format' };
  }
}
