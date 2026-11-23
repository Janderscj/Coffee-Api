# Performance Results

Last updated: 2026-11-22

This document records how the public menu endpoint was optimized with a compound index, a smaller response payload, and a Redis cache, and what each change measurably did. Every number below comes from raw autocannon or `bench.js` output. The tables report the **median of 3 runs** unless a row says otherwise.

## Summary

1. **The index fixed the real problem.** For the benchmark query, MongoDB went from examining 100,000 documents (a full collection scan plus an in-memory sort) to examining 21 (an index scan, no sort). On local MongoDB that is about 18-21x the throughput and about 20x lower median latency.
2. **The cache's benefit depends on how slow the database path is.** On a remote Atlas cluster, adding Redis raised throughput from about 103 to about 5,200 req/s (roughly 50x). On a fast local MongoDB, the same cache gave about 2.9x over the index alone (p50 from 10 ms to 3 ms). A warm cache lands near 5,200 req/s in both environments because a cache hit never touches MongoDB.
3. **The ~110 req/s ceiling on Atlas was on the database side, not in the application.** The same application code and index went from about 110 req/s (Atlas) to about 1,770 req/s (local MongoDB). This is consistent with Atlas Free-tier limits (documented at 100 operations per second), but these tests cannot separate that throttle from network latency.
4. **Trimming timestamps from the response cut payload size by about 23%** with no measurable change in throughput on Atlas, because the database was the bottleneck there.

## Test setup

**Data:** 100,000 synthetic menu items generated with `@faker-js/faker` (`scripts/seed.js`), in a database whose name contains `perf` so it can never touch real data. Roughly 12,857 of them match `category: "Hot"` and `available: true`. This is a synthetic stand-in for a large catalog. The real menu has a few dozen items.

**Endpoint under test:** `GET /api/menu/browse?category=Hot&limit=20`, which runs a query with filter `{ available: true, category }`, sort `{ price: 1 }`, and `limit + 1` for pagination.

**Tools:** `autocannon`, 20 concurrent connections, plus a script (`scripts/bench.js`) that cycles through 21 different URLs (7 categories x pages 1 to 3, limit 20) so the cache is not flattered by hammering a single key.

**Two environments, kept separate:**

|          | Environment A: Atlas                      | Environment B: local                                                                |
| -------- | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| Database | MongoDB Atlas cluster (remote)            | MongoDB 7.0 in Docker                                                               |
| Redis    | Redis in a local Docker container         | Redis in a Docker container                                                         |
| Other    | API and load generator on the dev machine | API, MongoDB, and Redis in Docker Compose on the same machine as the load generator |

**Method:**

- Morgan request logging and rate limiting were off during runs.
- The no-index baseline was measured with the index dropped (and Mongoose index creation disabled), then the index was re-added.
- Single-URL runs: 15 seconds on Atlas, **5 seconds** locally (so compare those rows within an environment, not across).
- `bench.js` runs: 15 seconds, 20 connections. `errors` and `non2xx` were 0 on every run.
- Cache cold = Redis flushed before the run. Cache warm = a repeat run without flushing.

## What was changed

**1. Compound index**

```js
menuItemSchema.index({ available: 1, category: 1, price: 1 });
```

Equality-filtered fields come first (`available`, `category`), then the sort field (`price`), so MongoDB can jump to the matching range and read documents already in price order.

**2. Response trimming:** `.select('-__v -createdAt -updatedAt')` on the browse query, so list responses omit fields the UI does not use.

**3. Redis cache-aside with a version key**

- Keys look like `menu:v<N>:browse:<category>:<q>:<page>:<limit>`.
- Any admin create, update, or delete runs `INCR menu:version`, which makes every older key unreachable at once. Entries also expire on their own after 60 seconds, which bounds staleness if an invalidation is ever missed.
- Every Redis call is wrapped in try/catch, so if Redis is down or `CACHE_ENABLED=false`, the endpoint falls back to MongoDB and returns `X-Cache: BYPASS`.
- Hits return the stored JSON string without parsing it again. The `X-Cache` header (`HIT` / `MISS` / `BYPASS`) makes behavior visible.

## Results

### Query plan (`explain("executionStats")`, local MongoDB, same 100k dataset)

|                     | No index               | With compound index                                |
| ------------------- | ---------------------- | -------------------------------------------------- |
| Winning plan        | `SORT` over `COLLSCAN` | `LIMIT` over `FETCH` over `IXSCAN` (no sort stage) |
| Documents examined  | 100,000                | 21                                                 |
| Index keys examined | 0                      | 21                                                 |
| Documents returned  | 21                     | 21                                                 |
| Execution time      | 53 ms                  | 4 ms                                               |

Without the index, MongoDB scanned all 100,000 documents, found 12,857 matches, sorted them in memory, and kept the first 21.

### Environment A: Atlas

Single URL (`category=Hot&limit=20`), 15 s, median of 3:

| Scenario         | Req/sec | p50     | p99     |
| ---------------- | ------- | ------- | ------- |
| No index         | 19.3    | 1000 ms | 1798 ms |
| + Compound index | 109.3   | 59 ms   | 808 ms  |
| + `.select()`    | 110.3   | 61 ms   | 819 ms  |

`bench.js` (21-URL mix), **one run each**:

| Scenario             | Req/sec | p50   | p99    |
| -------------------- | ------- | ----- | ------ |
| Cache off (index on) | 102.9   | 60 ms | 876 ms |
| Cache on, cold       | 3,988   | 3 ms  | 8 ms   |
| Cache on, warm       | 5,203   | 3 ms  | 6 ms   |

Notes: the "docs examined" figure for the Atlas no-index case was not captured separately. The 100,000 figure above comes from the local explain on an identical dataset. Bytes per second dropped from about 879 kB/s to about 680 kB/s with `.select()` (about 23% smaller responses) at the same request count.

### Environment B: local MongoDB in Docker

Single URL, **5 s**, median of 3:

| Scenario         | Req/sec | p50    | p99    |
| ---------------- | ------- | ------ | ------ |
| No index         | 84.8    | 219 ms | 385 ms |
| + Compound index | 1,780   | 10 ms  | 19 ms  |

`bench.js` (21-URL mix), 15 s, median of 3:

| Scenario         | Req/sec | p50    | p99    |
| ---------------- | ------- | ------ | ------ |
| No index         | 96.6    | 195 ms | 340 ms |
| + Compound index | 1,767   | 10 ms  | 20 ms  |
| + Redis, cold    | 5,070   | 3 ms   | 9 ms   |
| + Redis, warm    | 5,177   | 3 ms   | 8 ms   |

### Side by side (`bench.js` mix)

|                                         | Atlas       | Local Docker |
| --------------------------------------- | ----------- | ------------ |
| Index, no cache: req/sec                | about 103   | about 1,767  |
| Index, no cache: p99                    | 876 ms      | 20 ms        |
| Cache warm: req/sec                     | about 5,203 | about 5,177  |
| Cache warm: p99                         | 6 ms        | 8 ms         |
| Cache gain over index-only (throughput) | about 50x   | about 2.9x   |

### Raw `bench.js` runs, local MongoDB

| Scenario     | Run 1                          | Run 2                   | Run 3                  |
| ------------ | ------------------------------ | ----------------------- | ---------------------- |
| No index     | 100.14 req/s, p50 189, p99 321 | 96.6, p50 195, p99 340  | 93, p50 203, p99 344   |
| + Index      | 1774.94, p50 10, p99 20        | 1716.47, p50 11, p99 22 | 1766.8, p50 10, p99 19 |
| + Redis cold | 4973.27, p50 3, p99 10         | 5069.54, p50 3, p99 9   | 5169, p50 3, p99 9     |
| + Redis warm | 5177.27, p50 3, p99 8          | 5082.47, p50 3, p99 9   | 5305.74, p50 3, p99 7  |

## Analysis

- **Index.** The explain output and the load tests agree: examining 21 documents instead of 100,000 and skipping the in-memory sort accounts for the roughly 20x gain locally. Index order matters. Equality fields go first, then the sort field.
- **Why Atlas plateaued near 110 req/s.** Index-only, `.select()`, and cache-off runs all sat at about 103-110 req/s with a p99 near 800-900 ms, and no application-side change moved them. The same code against local MongoDB reached about 1,770 req/s with a p99 near 20 ms. That points to the remote database path. Atlas Free clusters are documented as limited to 100 operations per second, and queued operations can wait more than a second ([Atlas free cluster limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/)), which matches the pattern, but network latency is also part of the gap and was not isolated.
- **Cache.** Warm cache throughput (about 5,200 req/s) is nearly identical across environments because a hit skips MongoDB entirely. At that rate the ceiling is likely Node, Redis, and the load generator sharing one machine, not the database. The cache multiplier differs only because the baseline underneath it differs.
- **`.select()`.** It shrank payloads by about 23% but did not change throughput on Atlas, because the database throttle was the limiting factor. Its benefit would show up as lower bandwidth or on a faster database path.

## Limitations

- **Best-case hit ratio.** The benchmark uses only 21 distinct URLs, so the cold run is only briefly cold: roughly 21 misses (possibly a few dozen, since concurrent requests can miss the same key) out of about 76,000 requests. The hit ratio is likely above 99.9%, but this is an estimate, not a measurement from `INFO stats`. Real traffic with more variety would hit less often.
- **Synthetic data and one machine.** 100k generated items, and (in the local runs) the load generator, API, MongoDB, and Redis all competed for the same CPU. Absolute numbers are not production capacity.

## Trade-offs

- **Staleness:** a missed invalidation can serve outdated data for up to 60 seconds. The version-key scheme invalidates on every admin write, and the TTL is the backstop.
- **Cache stampede:** if many requests arrive for the same cold key at once, each one queries MongoDB. Not mitigated yet. A lock or request coalescing would fix it.
- **Extra infrastructure and failure mode:** Redis is another service to run and monitor. The app degrades to direct database reads (`BYPASS`) if Redis is unavailable.
- **Index cost:** the compound index uses extra storage and slightly slows writes. For a menu that is read far more often than it is edited, that is a good trade.

## What has and has not been verified

Verified in testing: Redis connectivity from the API (via `redis-cli monitor`), `MISS` followed by `HIT` on repeated requests, and the benchmark results above with zero errors. Invalidation after an admin edit (expect `MISS` with the new data and `menu:version` incremented), and the Redis-down fallback (expect `X-Cache: BYPASS` and normal responses).

## Reproducing

```bash

# Seed a perf database (the seed script refuses to run unless the DB name contains "perf")
MONGO_URI="mongodb://localhost:27017/coffee_perf" node scripts/seed.js

# Single-URL test (do a 5 s warm-up run first)
npx autocannon -c 20 -d 15 "http://localhost:5000/api/menu/browse?category=Hot&limit=20"

# 21-URL mix
node scripts/bench.js

# Query plan (mongosh)
db.menuitems.find({ category: "Hot", available: true }).sort({ price: 1 }).limit(21).explain("executionStats")

# Cache checks
redis-cli flushall          # cold start
redis-cli config resetstat  # then run bench.js
redis-cli info stats        # keyspace_hits / keyspace_misses for a measured hit ratio
curl -i "http://localhost:5000/api/menu/browse?category=Hot&limit=5"   # look for X-Cache
```
