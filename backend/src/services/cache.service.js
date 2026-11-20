import logger from '../config/logger.js';

let redisClient = null;
let redisConnected = false;

// Try to initialize Redis client if available
try {
  const redis = await import('../config/redis.js');
  redisClient = redis.default;
  redisConnected = true;
} catch (e) {
  logger.warn('Redis not available - caching disabled. Run Redis server or update REDIS_URL.');
  redisConnected = false;
}

const DEFAULT_TTL = 3600; // Default time-to-live for cache in seconds (1 hour)

export const getFromCache = async key => {
  if (!redisConnected || !redisClient) return null;

  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    logger.error(`Failed to get from cache: ${e.message}`);
    return null;
  }
};

export const setInCache = async (key, value, ttl = DEFAULT_TTL) => {
  if (!redisConnected || !redisClient) return;

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (e) {
    logger.error(`Failed to set to cache: ${e.message}`);
  }
};

export const deleteFromCache = async key => {
  if (!redisConnected || !redisClient) return;

  try {
    await redisClient.del(key);
  } catch (e) {
    logger.error(`Failed to delete from cache: ${e.message}`);
  }
};

export const invalidateMenuCache = async () => {
  if (!redisConnected || !redisClient) return;

  try {
    const keys = await redisClient.keys('menu:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (e) {
    logger.error(`Failed to invalidate menu cache: ${e.message}`);
  }
};
