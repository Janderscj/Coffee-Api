import { createClient } from 'redis';
import logger from '../config/logger.js';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: retries => Math.min(retries * 50, 2000),
  },
});

try {
  await redisClient.connect();
  console.log('Redis Client Connected Successfully');
} catch (error) {
  console.error('redis unavailable, continuing without cache', error);
}

export default redisClient;
