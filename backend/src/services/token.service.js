import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is missing from environment variables');
  throw new Error('JWT_SECRET is missing');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Generates a signed JWT token with the given payload. Options can override default expiration.
export const signToken = (payload, options = {}) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options });
  } catch (e) {
    logger.error('Failed to sign token', e);
    throw new Error('Failed to generate token');
  }
};

// Verifies and decodes a JWT token. Returns the decoded payload.
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    logger.error('Failed to verify token', e);
    throw new Error('Invalid or expired token');
  }
};

// Convenience object for backwards compatibility
export const jwtToken = {
  sign: signToken,
  verify: verifyToken,
};
