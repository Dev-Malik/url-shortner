// Reads and validates environment variables (Zod) once, exports a typed config object.
import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  BASE_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
})

export const config = envSchema.parse(process.env)