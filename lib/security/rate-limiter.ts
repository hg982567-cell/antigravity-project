interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory token bucket store for rate limiting
const store = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  store.forEach((record, key) => {
    if (now > record.resetTime) {
      store.delete(key);
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // Time frame in milliseconds (default: 60s)
  max?: number;      // Max allowed hits within windowMs (default: 10)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in ms
}

/**
 * Checks and increments rate limit for a specific key (IP + endpoint or user identifier).
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 10;
  const now = Date.now();

  const record = store.get(key);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    store.set(key, newRecord);
    return {
      success: true,
      limit: max,
      remaining: max - 1,
      reset: newRecord.resetTime,
    };
  }

  if (record.count >= max) {
    return {
      success: false,
      limit: max,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: max,
    remaining: max - record.count,
    reset: record.resetTime,
  };
}

/**
 * Extracts a client IP address safely from Request headers (x-forwarded-for, cf-connecting-ip, etc.)
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}
