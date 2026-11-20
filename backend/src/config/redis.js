import { createClient } from 'redis';
import logger from '../config/logger.js';

const Client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: retries => Math.min(retries * 50, 2000),
  },
});

Client.on('error', err => logger.error(`Redis Client Error: ${err}`));
Client.on('connect', () => logger.info('Redis Client Connected'));
await Client.connect();

export default Client;
