// k6 load test for GET /:code. Run with cache on and off and record p50/p95/p99 and req/s.
import http from "k6/http"
import { check } from "k6"

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001"

export const options = {
  vus: 50,
  duration: "20s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<100"],
  },
}

export function setup() {
  const res = http.post(
    `${BASE_URL}/shorten`,
    JSON.stringify({ url: "https://example.com/load-test" }),
    { headers: { "Content-Type": "application/json" } }
  )
  return { code: res.json("code") }
}

export default function (data) {
  const res = http.get(`${BASE_URL}/${data.code}`, { redirects: 0 })
  check(res, { "is 302": (r) => r.status === 302 })
}
