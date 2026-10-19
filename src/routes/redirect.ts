// GET /:code - look up the code (cache first, then Postgres), respond with a redirect (301 or 302), record a click.
import type { FastifyInstance } from "fastify"
import { resolveCode } from "../services/urlService.js"

const CODE_PATTERN = /^[0-9A-Za-z]{1,32}$/

export async function redirectRoutes(app: FastifyInstance) {
  app.get<{ Params: { code: string } }>("/:code", async (request, reply) => {
    const { code } = request.params

    if (!CODE_PATTERN.test(code)) {
      return reply.status(404).send({ error: "Not found" })
    }

    const longUrl = await resolveCode(code)
    if (!longUrl) {
      return reply.status(404).send({ error: "Not found" })
    }

    return reply.redirect(longUrl, 302)
  })
}