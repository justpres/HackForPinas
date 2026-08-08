/**
 * Simple in-memory rate limiter based on IP address.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

/**
 * Rate limits requests based on IP address.
 * @param ip - The IP address to limit.
 * @param options - Configuration options.
 * @returns Object indicating success and remaining limit.
 */
export function rateLimit(
  ip: string,
  options: { windowMs?: number; max?: number } = {}
): { success: boolean; remaining: number; resetAt: Date } {
  const windowMs = options.windowMs || 60 * 60 * 1000; // 1 hour
  const max = options.max || 5;
  const now = Date.now();
  
  // Cleanup expired entries
  store.forEach((record, key) => {
    if (now > record.resetAt) {
      store.delete(key);
    }
  });

  let record = store.get(ip);

  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  record.count += 1;
  store.set(ip, record);

  const success = record.count <= max;
  const remaining = Math.max(0, max - record.count);
  const resetAt = new Date(record.resetAt);

  return { success, remaining, resetAt };
}
