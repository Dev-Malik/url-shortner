# Benchmarks

## Redirect: Postgres only vs Redis cache-aside

**Test:** `k6 run load-tests/redirect.k6.js`, 50 virtual users for 20 seconds, all requesting the same short code (`GET /:code`, redirects not followed).

**Setup:** everything on one Mac mini (app, Postgres 17, Redis 7 in Docker, and k6), Fastify request logging enabled, single app instance.

| Metric | Postgres only | With Redis cache | Change |
|---|---|---|---|
| Throughput | 8,229 req/s | 10,105 req/s | +22.8% |
| avg latency | 6.02 ms | 4.90 ms | -18.6% |
| median | 5.69 ms | 4.47 ms | -21.4% |
| p(90) | 6.79 ms | 6.26 ms | -7.8% |
| p(95) | 7.55 ms | 6.91 ms | -8.5% |
| max | 41.3 ms | 54.7 ms | n/a (single outlier) |
| failed requests | 0.00% | 0.00% | |

## Notes and limits

- Each number is a **single run**. Small differences (especially p95 and max) are within normal run-to-run noise; repeat several times before drawing conclusions.
- The test requests **one hot key**. This is the best case for a cache. Real traffic spreads across many codes, so a mixed-key test is a TODO.
- The gain is modest because Postgres already serves an indexed single-row lookup in a few milliseconds from memory. With the database no longer the dominant cost, the remaining time is mostly the Node process, request logging, and k6 sharing the same machine.
- Next experiment: run two or more app instances behind nginx and see whether throughput scales.
