import mongoose from 'mongoose';
import redis from '../config/redis.js';

// Rejects if the promise takes longer than `ms`, so a hung dependency can't hang the health check
const withTimeout = async (promise, ms) => {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const checkMongo = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return 'down';
    await withTimeout(mongoose.connection.db.admin().ping(), 2000);
    return 'up';
  } catch {
    return 'down';
  }
};

const checkRedis = async () => {
  try {
    if (!redis.isReady) return 'down';
    await withTimeout(redis.ping(), 2000);
    return 'up';
  } catch {
    return 'down';
  }
};

// @desc    Report whether the app and its dependencies are working
// @route   GET /health
// @access  Public
export const healthCheck = async (req, res) => {
  const [mongo, redisStatus] = await Promise.all([checkMongo(), checkRedis()]);

  const status = mongo !== 'up' ? 'down' : redisStatus !== 'up' ? 'degraded' : 'ok';

  res.status(status === 'down' ? 503 : 200).json({
    status,
    uptimeSeconds: Math.round(process.uptime()),
    checks: { mongo, redis: redisStatus },
  });
};
