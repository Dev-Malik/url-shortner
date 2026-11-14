// Redis client and cache-aside helpers (get/set with TTL).
import { Redis } from "ioredis"
import { config } from "../config.js"

const URL_TTL_SECONDS = 60 * 60

export const redis = new Redis(config.REDIS_URL)

export async function getCachedUrl(code: string): Promise<string | null> {
  return redis.get(`url:${code}`)
}

export async function setCachedUrl(code: string, longUrl: string): Promise<void> {
  await redis.set(`url:${code}`, longUrl, "EX", URL_TTL_SECONDS)
}
