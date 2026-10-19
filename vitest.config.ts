import { existsSync, readFileSync } from "node:fs"
import { parseEnv } from "node:util"
import { defineConfig } from "vitest/config"

// Vitest doesn't read .env on its own, so pass it in explicitly.
// In CI there is no .env file; real environment variables are used instead.
const fileEnv = existsSync(".env") ? parseEnv(readFileSync(".env", "utf8")) : {}

export default defineConfig({
  test: { env: fileEnv },
})
