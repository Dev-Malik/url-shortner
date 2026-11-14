// Redis client and cache-aside helpers (get/set with TTL).
import { Redis } from "ioredis"
import { config } from "../config.js"

const URL_TTL_SECONDS = 60 * 60

// The cache must never slow down or break the app: fail fast instead of queueing
// commands while Redis is unreachable, and give up on slow commands quickly.
export const redis = new Redis(config.REDIS_URL, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  commandTimeout: 200,
})

// Without a listener, ioredis prints an "unhandled error event" on every failed reconnect.
redis.on("error", (err: NodeJS.ErrnoException) => {
  console.warn(`[redis] ${err.code ?? err.message ?? err.name}`)
})

export async function getCachedUrl(code: string): Promise<string | null> {
  try {
    return await redis.get(`url:${code}`)
  } catch {
    return null
  }
}

export async function setCachedUrl(code: string, longUrl: string): Promise<void> {
  try {
    await redis.set(`url:${code}`, longUrl, "EX", URL_TTL_SECONDS)
  } catch {
    // Not cached this time; the next request will simply read from Postgres again.
  }
}
