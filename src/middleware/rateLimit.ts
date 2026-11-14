// Fastify hook that applies rateLimiter.ts per IP / API key.
import type { FastifyReply, FastifyRequest } from "fastify"
import { checkRateLimit } from "../services/rateLimiter.js"

interface RateLimitOptions {
  name: string
  limit: number
  windowSeconds: number
}

export function rateLimit({ name, limit, windowSeconds }: RateLimitOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await checkRateLimit(`${name}:${request.ip}`, limit, windowSeconds)

    reply.header("X-RateLimit-Limit", limit)
    reply.header("X-RateLimit-Remaining", result.remaining)

    if (!result.allowed) {
      reply.header("Retry-After", result.retryAfterSeconds)
      return reply.status(429).send({ error: "Too many requests. Please try again later." })
    }
  }
}
