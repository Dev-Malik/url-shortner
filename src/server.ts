// Entry point: loads config, connects Postgres + Redis, starts listening, handles graceful shutdown.
import { buildApp } from "./app.js"
import { config } from "./config.js"
import { pool } from "./db/pool.js"
import { redis } from "./cache/redis.js"

const app = buildApp()

// Docker stops a container by sending SIGTERM and waits ~10s before killing it.
// Finish in-flight requests and close connections cleanly instead of being killed mid-request.
async function shutdown(signal: string) {
  app.log.info(`${signal} received, shutting down`)
  try {
    await app.close()
    await pool.end()
    redis.disconnect()
    process.exit(0)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"))
process.on("SIGINT", () => void shutdown("SIGINT"))

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
