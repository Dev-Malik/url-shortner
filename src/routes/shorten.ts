// POST /shorten - validate the long URL, generate a code, store it, return the short URL.
import type { FastifyInstance } from "fastify";
import {z} from "zod"
import { config } from "../config.js";
import { createShortUrl } from "../services/urlService.js";

const bodySchema = z.object({
    url: z.url({protocol: /^https?$/}).max(2048),
})

export async function shortenRoutes(app: FastifyInstance) {
  app.post("/shorten", async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid URL. It must start with http:// or https:// and be at most 2048 characters.",
      })
    }

    const code = await createShortUrl(parsed.data.url)
    return reply.status(201).send({ code, shortUrl: `${config.BASE_URL}/${code}` })
  })
}
