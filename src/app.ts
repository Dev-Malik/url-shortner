// Builds the Fastify app: registers plugins, middleware and routes. Kept separate from server.ts so tests can import it without opening a port.
import Fastify from "fastify"
import { healthRoutes } from "./routes/health.js"
import { shortenRoutes } from "./routes/shorten.js"
import { redirectRoutes } from "./routes/redirect.js"

export function buildApp() {
    const app = Fastify({logger:true})
    app.register(healthRoutes)
    app.register(shortenRoutes)
    app.register(redirectRoutes)
    return app
}