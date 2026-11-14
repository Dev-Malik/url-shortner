import { describe, it, expect, vi, afterEach } from "vitest"
import { redis, getCachedUrl, setCachedUrl } from "../../src/cache/redis.js"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("cache helpers when Redis is unavailable", () => {
  it("getCachedUrl returns null instead of throwing", async () => {
    vi.spyOn(redis, "get").mockRejectedValue(new Error("Redis is down"))

    await expect(getCachedUrl("abc123")).resolves.toBeNull()
  })

  it("setCachedUrl does not throw", async () => {
    vi.spyOn(redis, "set").mockRejectedValue(new Error("Redis is down"))

    await expect(setCachedUrl("abc123", "https://example.com")).resolves.toBeUndefined()
  })
})
