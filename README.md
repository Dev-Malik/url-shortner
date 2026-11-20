# URL Shortener

![CI](https://github.com/Dev-Malik/url-shortner/actions/workflows/ci.yml/badge.svg)

A URL shortener built with TypeScript, Fastify, Postgres and Redis, with a focus on the engineering behind it: caching, rate limiting, click analytics and measured performance.

## Features

- `POST /shorten` creates a random 7-character base62 code (`http`/`https` URLs only)
- `GET /:code` redirects (302), served from Redis when cached and falling back to Postgres if Redis is down
- Redis-backed rate limiting on `POST /shorten` (fixed window, per IP, fails open)
- SQL migrations, graceful shutdown, multi-stage Docker image running as a non-root user
- Redirect benchmarks with k6 in [docs/BENCHMARKS.md](docs/BENCHMARKS.md)

## Stack

- **TypeScript** (strict) on Node 22
- **Fastify** for the HTTP API
- **Postgres 17** as the source of truth
- **Redis 7** for caching and rate limiting
- **Zod** for validating config and request input
- **Docker Compose** for local infrastructure
- **Vitest** for tests, **k6** for load tests

## Run locally

**Everything in Docker (one command):**

```bash
docker compose up --build    # Postgres, Redis, migrations, then the app on http://localhost:3001
# port taken? APP_PORT=3999 docker compose up --build
```

**Develop with the app on your machine** (Postgres and Redis in Docker):

```bash
cp .env.example .env                    # then set DATABASE_URL to match docker-compose.yml
docker compose up -d postgres redis
npm install
npm run migrate
npm run dev                             # PORT from .env, check /health
npm test
```



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
