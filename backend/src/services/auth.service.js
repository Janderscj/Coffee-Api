import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';

// Hashes a password using bcrypt with 10 salt rounds. Returns the hashed password.
export const hashPassword = async password => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (e) {
    logger.error('Failed to hash password', e);
    throw new Error('Failed to hash password');
  }
};

// Compares a plain password with a hashed password. Returns true if they match, false otherwise.
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (e) {
    logger.error('Failed to compare password', e);
    throw new Error('Failed to compare password');
  }
};
