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
 * Checks if a URL is actually live and reachable (returns a success status code < 400).
 * @param url - The URL string to verify.
 * @returns Promise resolving to boolean.
 */
export async function isLiveUrl(url: string): Promise<boolean> {
  try {
    // Exclude localhost/internal URLs to avoid loop issues
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return true;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    
    return res.status < 400;
  } catch (error) {
    console.warn(`Reachability check failed for ${url}:`, error);
    return false;
  }
}

/**
 * Validates a redirect URL, ensuring it is HTTPS, has an allowed domain, and is reachable.
 * @param url - The URL string to validate.
 * @returns Promise resolving to an object containing validation result.
 */
export async function validateRedirectUrl(url: string): Promise<{ valid: boolean; reason?: string; needsReview?: boolean }> {
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.protocol !== 'https:') {
      return { valid: false, reason: 'Must use HTTPS' };
    }

    const { allowed } = isAllowedDomain(url);
    
    if (!allowed) {
      return { valid: false, reason: 'Domain not in allow-list' };
    }

    // Reachability check
    const live = await isLiveUrl(url);
    if (!live) {
      return { valid: false, reason: 'URL is unreachable or broken' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Invalid URL format' };
  }
}
