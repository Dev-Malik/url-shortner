import { describe, it, expect, vi, afterEach, beforeAll } from "vitest"
import { randomUUID } from "node:crypto"
import Fastify from "fastify"
import { redis } from "../../src/cache/redis.js"
import { checkRateLimit } from "../../src/services/rateLimiter.js"
import { rateLimit } from "../../src/middleware/rateLimit.js"

// The client starts out "connecting" and rejects commands until it is ready (fail-fast setting),
// so wait for the connection before the real-Redis tests run.
beforeAll(async () => {
  if (redis.status !== "ready") {
    await new Promise<void>((resolve) => redis.once("ready", () => resolve()))
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("checkRateLimit", () => {
  it("allows requests up to the limit, then blocks", async () => {
    const key = `test:${randomUUID()}`

    const first = await checkRateLimit(key, 3, 60)
    const second = await checkRateLimit(key, 3, 60)
    const third = await checkRateLimit(key, 3, 60)
    const fourth = await checkRateLimit(key, 3, 60)

    expect([first.allowed, second.allowed, third.allowed]).toEqual([true, true, true])
    expect([first.remaining, second.remaining, third.remaining]).toEqual([2, 1, 0])
    expect(fourth.allowed).toBe(false)
    expect(fourth.remaining).toBe(0)
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0)
    expect(fourth.retryAfterSeconds).toBeLessThanOrEqual(60)
  })

  it("counts each key separately", async () => {
    const a = `test:${randomUUID()}`
    const b = `test:${randomUUID()}`

    await checkRateLimit(a, 1, 60)
    const blocked = await checkRateLimit(a, 1, 60)
    const other = await checkRateLimit(b, 1, 60)

    expect(blocked.allowed).toBe(false)
    expect(other.allowed).toBe(true)
  })

  it("allows requests again after the window passes", async () => {
    const key = `test:${randomUUID()}`

    await checkRateLimit(key, 1, 1)
    expect((await checkRateLimit(key, 1, 1)).allowed).toBe(false)

    await new Promise((resolve) => setTimeout(resolve, 1100))

    expect((await checkRateLimit(key, 1, 1)).allowed).toBe(true)
  })

  it("lets requests through when Redis fails", async () => {
    vi.spyOn(redis, "multi").mockImplementation(() => {
      throw new Error("Redis is down")
    })

    const result = await checkRateLimit(`test:${randomUUID()}`, 1, 60)

    expect(result.allowed).toBe(true)
  })
})

describe("rateLimit middleware", () => {
  it("returns 429 with Retry-After once the limit is exceeded", async () => {
    const app = Fastify()
    app.get(
      "/ping",
      { preHandler: rateLimit({ name: `test-${randomUUID()}`, limit: 2, windowSeconds: 60 }) },
      async () => ({ ok: true })
    )

    const r1 = await app.inject({ method: "GET", url: "/ping" })
    const r2 = await app.inject({ method: "GET", url: "/ping" })
    const r3 = await app.inject({ method: "GET", url: "/ping" })

    expect([r1.statusCode, r2.statusCode, r3.statusCode]).toEqual([200, 200, 429])
    expect(r1.headers["x-ratelimit-limit"]).toBe("2")
    expect(r1.headers["x-ratelimit-remaining"]).toBe("1")
    expect(r3.headers["x-ratelimit-remaining"]).toBe("0")
    expect(Number(r3.headers["retry-after"])).toBeGreaterThan(0)

    await app.close()
  })
})
