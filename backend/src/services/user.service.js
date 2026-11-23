import { signToken } from './token.service.js';
import { comparePassword, hashPassword } from './auth.service.js';
import User from '../models/user.Model.js';
import logger from '../config/logger.js';

// Authenticates a user by email and password. Returns user data with JWT token.
export const authenticateUser = async ({ email, password }) => {
  try {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = signToken({ id: user._id });

    logger.info(`User ${email} authenticated successfully`);
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
  } catch (e) {
    logger.error(`Authentication failed: ${e.message}`);
    throw e;
  }
};

// Registers a new user with hashed password. Returns user data with JWT token.
export const registerUser = async ({ name, email, password, role = 'user' }) => {
  try {
    if (!name || !email || !password) {
      const error = new Error('Name, email, and password are required');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ name, email, password: hashedPassword, role });

    const token = signToken({ id: newUser._id });

    logger.info(`User ${newUser.email} registered successfully`);
    return {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token,
    };
  } catch (e) {
    logger.error(`Registration failed: ${e.message}`);
    throw e;
  }
};

// Retrieves a user by ID without the password field
export const getUserById = async id => {
  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    logger.info(`Retrieved user: ${user.email}`);
    return user;
  } catch (e) {
    logger.error(`Failed to get user: ${e.message}`);
    throw e;
  }
};
