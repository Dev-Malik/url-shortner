import { describe, it, expect } from "vitest"
import { buildApp } from "../../src/app.js"
import { config } from "../../src/config.js"

describe("POST /shorten", () => {
  it("creates a short url", async () => {
    const app = buildApp()

    const response = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url: "https://example.com/hello" },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.code).toMatch(/^[0-9A-Za-z]{7}$/)
    expect(body.shortUrl).toBe(`${config.BASE_URL}/${body.code}`)

    await app.close()
  })

  it("rejects non-http urls", async () => {
    const app = buildApp()

    const response = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url: "javascript:alert(1)" },
    })

    expect(response.statusCode).toBe(400)

    await app.close()
  })
})