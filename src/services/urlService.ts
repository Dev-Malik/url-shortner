// Business logic: create a short URL, resolve a code, handle custom aliases and expiry.
import { pool } from "../db/pool.js";
import { getCachedUrl, setCachedUrl } from "../cache/redis.js";
import { generateCode } from "./codeGenerator.js";

const MAX_ATTEMPTS = 5

export async function createShortUrl(longUrl: string): Promise<string> {
    for(let attempt=0;attempt < MAX_ATTEMPTS; attempt++) {
        const code = generateCode()
        try {
            await pool.query(
                "INSERT INTO urls (code, long_url) VALUES ($1, $2)",
                [code, longUrl]
            )
            return code
        } catch (err) {
            if (isUniqueViolation(err)) continue
            throw err
        }
    }
    throw new Error("Could not generate a unique code")
}

export async function resolveCode(code: string): Promise<string | null> {
  const cached = await getCachedUrl(code)
  if (cached) return cached

  const result = await pool.query(
    "SELECT long_url FROM urls WHERE code = $1 AND (expires_at IS NULL OR expires_at > now())",
    [code]
  )
  const longUrl: string | null = result.rows[0]?.long_url ?? null

  if (longUrl) await setCachedUrl(code, longUrl)
  return longUrl
}

function isUniqueViolation(err: unknown): boolean {
    return typeof err === "object" && err !== null && "code" in err && err.code === "23505"
}
