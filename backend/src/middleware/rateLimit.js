import rateLimit from 'express-rate-limit';

// Skip rate limiting if not in production and RATE_LIMIT_ENABLED is set to false
const limiterOff = () =>
  process.env.NODE_ENV !== 'production' && process.env.RATE_LIMIT_ENABLED === 'false';
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  skip: limiterOff,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skip: limiterOff,
});
