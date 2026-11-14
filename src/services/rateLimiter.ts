// Fixed-window rate limiting backed by Redis.
import { redis } from "../cache/redis.js"

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`

  try {
    // MULTI runs the three commands as one unit, so no other request can slip in between them.
    // EXPIRE ... NX sets the window only when the key has none yet, i.e. on the first request.
    const results = await redis
      .multi()
      .incr(redisKey)
      .expire(redisKey, windowSeconds, "NX")
      .ttl(redisKey)
      .exec()

    const count = Number(results?.[0]?.[1])
    const ttl = Number(results?.[2]?.[1])
    if (!Number.isFinite(count)) return failOpen(limit)

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
    }
  } catch {
    return failOpen(limit)
  }
}

// If Redis is unavailable we let the request through rather than blocking every visitor.
function failOpen(limit: number): RateLimitResult {
  return { allowed: true, remaining: limit, retryAfterSeconds: 0 }
}
