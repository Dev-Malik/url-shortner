import { describe, it, expect } from "vitest"
import { buildApp } from "../../src/app.js"
import { config } from "../../src/config.js"

describe("POST /shorten", () => {
    it("redirects a short code to the original url", async () => {
    const app = buildApp()

    const created = await app.inject({
        method: "POST",
        url: "/shorten",
        payload: { url: "https://example.com/redirect-me" },
    })
    const { code } = created.json()

    const response = await app.inject({ method: "GET", url: `/${code}` })

    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe("https://example.com/redirect-me")

    await app.close()
    })

    it("returns 404 for an unknown code", async () => {
    const app = buildApp()

    const response = await app.inject({ method: "GET", url: "/zzzzzzz" })

    expect(response.statusCode).toBe(404)

    await app.close()
    })
})