# URL Shortener

A URL shortener built with TypeScript, Fastify, Postgres and Redis, with a focus on the engineering behind it: caching, rate limiting, click analytics and measured performance.

> **Status:** work in progress. Project setup, config validation and a `/health` endpoint are done. The shortening and redirect features are next.

## Stack

- **TypeScript** (strict) on Node 22
- **Fastify** for the HTTP API
- **Postgres 17** as the source of truth
- **Redis 7** for caching and rate limiting
- **Zod** for validating config and request input
- **Docker Compose** for local infrastructure
- **Vitest** for tests, **k6** for load tests

## Run locally

```bash
cp .env.example .env     # then set DATABASE_URL to match docker-compose.yml
docker compose up -d     # starts Postgres and Redis
npm install
npm run dev              # http://localhost:3000/health
```

## Roadmap

- [x] Project setup, typed config, `/health` endpoint
- [ ] Database migrations and `POST /shorten`
- [ ] `GET /:code` redirect with Redis cache-aside
- [ ] Rate limiting, URL validation (including SSRF protection)
- [ ] Click analytics written in batches, off the redirect path
- [ ] Dockerfile, CI, load tests with benchmark results
- [ ] Design decisions and capacity estimates in `docs/`

## Project layout

```
src/
  routes/       HTTP handlers (no business logic)
  services/     business logic
  db/           Postgres pool and SQL migrations
  cache/        Redis client
  middleware/   rate limiting, error handling
  lib/          small helpers
tests/          unit and integration tests
load-tests/     k6 scripts
docs/           design notes and benchmarks
```
