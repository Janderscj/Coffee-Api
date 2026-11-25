import redis from '../config/redis.js';
import { cacheRequests } from './metrics.js';

export const VERSION_KEY = 'menu:version';
export const TTL_SECONDS = 60;

export const cacheEnabled = () => process.env.CACHE_ENABLED !== 'false' && redis.isReady;

// Call after any admin change: old keys become unreachable and expire on their own.
export const bumpMenuCache = async () => {
  if (!redis.isReady) return;
  try {
    await redis.incr(VERSION_KEY);
  } catch (err) {
    console.error('Cache invalidation failed:', err.message);
  }
};

// Runs fetchFn on a miss. Always returns { json: <string>, cache: 'HIT' | 'MISS' | 'BYPASS' }.
export const withMenuCache = async (keyParts, fetchFn, ttl = TTL_SECONDS) => {
  let key = null;

  if (cacheEnabled()) {
    try {
      const version = (await redis.get(VERSION_KEY)) || '0';
      key = `menu:v${version}:${keyParts.join(':')}`;
      const cached = await redis.get(key);
      if (cached) {
        cacheRequests.inc({ result: 'HIT' });
        return { json: cached, cache: 'HIT' };
      }
    } catch (err) {
      console.error('Cache read failed:', err.message);
      key = null;
    }
  }

  const json = JSON.stringify(await fetchFn());

  if (key) {
    try {
      await redis.set(key, json, { EX: ttl });
    } catch (err) {
      console.error('Cache write failed:', err.message);
    }
  }

  cacheRequests.inc({ result: key ? 'MISS' : 'BYPASS' });
  return { json, cache: key ? 'MISS' : 'BYPASS' };
};
