// GET /health - liveness/readiness check used by Docker healthchecks and load balancers.
import type {FastifyInstance} from "fastify"

export async function healthRoutes(app: FastifyInstance){
    app.get("/health", async () => ({status: "ok"}))
}