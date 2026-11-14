import { existsSync, readFileSync } from "node:fs"
import { parseEnv } from "node:util"
import { defineConfig } from "vitest/config"

// Vitest doesn't read .env on its own, so pass it in explicitly.
// In CI there is no .env file; real environment variables are used instead.
const fileEnv = existsSync(".env") ? parseEnv(readFileSync(".env", "utf8")) : {}

export default defineConfig({
  // High limit so the many POSTs made by the test suite never hit the rate limiter by accident.
  // The rate limiter has its own tests with small limits.
  test: { env: { ...fileEnv, RATE_LIMIT_SHORTEN_MAX: "1000" } },
})
