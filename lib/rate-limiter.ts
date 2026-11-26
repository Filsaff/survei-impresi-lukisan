/**
 * In-Memory Sliding-Window Rate Limiter
 * Protects survey API routes from DDoS, bot flooding, and database connection exhaustion.
 * Zero external dependencies. Automatically cleans up expired windows.
 */

interface RateLimitRecord {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodically clean up stale entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      // Remove timestamps older than 10 minutes
      record.timestamps = record.timestamps.filter((t) => now - t < 600000)
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key)
      }
    }
  }, 300000)

  // Do not block Node event loop from terminating when tests or scripts finish
  if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref()
  }
}

/**
 * Extracts client IP address from request headers with reverse-proxy support.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // First IP is the original client
    const ip = forwardedFor.split(',')[0].trim()
    if (ip) return ip
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp.trim()

  return '127.0.0.1'
}

export interface RateLimitResult {
  allowed: boolean
  current: number
  limit: number
  remaining: number
  retryAfterSeconds: number
}

/**
 * Core sliding window rate check
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const threshold = now - windowMs

  let record = rateLimitStore.get(key)
  if (!record) {
    record = { timestamps: [] }
    rateLimitStore.set(key, record)
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((t) => t > threshold)

  if (record.timestamps.length >= limit) {
    const oldestInWindow = record.timestamps[0]
    const resetTime = oldestInWindow + windowMs
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000))

    return {
      allowed: false,
      current: record.timestamps.length,
      limit,
      remaining: 0,
      retryAfterSeconds,
    }
  }

  // Add current request timestamp
  record.timestamps.push(now)

  return {
    allowed: true,
    current: record.timestamps.length,
    limit,
    remaining: limit - record.timestamps.length,
    retryAfterSeconds: 0,
  }
}

/**
 * Pre-configured rate limiters for survey endpoints:
 * - Start Session: Max 5 attempts per 60 seconds per IP (protects database allocation lock)
 * - Answer Save: Max 60 saves per 60 seconds per IP (1 answer/sec is plenty for humans, blocks bot bursts)
 * - Complete Survey: Max 5 attempts per 60 seconds per IP
 * - Load Session: Max 30 loads per 60 seconds per IP
 */
export function rateLimitSurveyStart(request: Request): RateLimitResult {
  const ip = getClientIp(request)
  return checkRateLimit(`survey_start:${ip}`, 5, 60)
}

export function rateLimitSurveyAnswer(request: Request): RateLimitResult {
  const ip = getClientIp(request)
  return checkRateLimit(`survey_answer:${ip}`, 60, 60)
}

export function rateLimitSurveyComplete(request: Request): RateLimitResult {
  const ip = getClientIp(request)
  return checkRateLimit(`survey_complete:${ip}`, 5, 60)
}

export function rateLimitSurveySession(request: Request): RateLimitResult {
  const ip = getClientIp(request)
  return checkRateLimit(`survey_session:${ip}`, 30, 60)
}
