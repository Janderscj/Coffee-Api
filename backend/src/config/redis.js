import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
  disableOfflineQueue: true, // fail fast while disconnected instead of queuing commands
  socket: {
    connectTimeout: 2000,
    // Retry forever with capped exponential backoff: 100ms, 200ms, 400ms ... up to 5s
    reconnectStrategy: retries => Math.min(100 * 2 ** retries, 5000),
  },
});

redis.on('error', err => console.error('Redis error:', err.message));
redis.on('reconnecting', () => console.warn('Redis reconnecting...'));
redis.on('ready', () => console.log('Redis ready'));
redis.on('end', () => console.warn('Redis connection closed'));

// Connect in the background so the API starts even if Redis is down.
// Until the client is ready, the cache is skipped and requests go to MongoDB (X-Cache: BYPASS).
redis.connect().catch(err => console.error('Redis initial connect failed:', err.message));

export default redis;
