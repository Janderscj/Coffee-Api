import { verifyToken } from '../services/token.service.js';
import User from '../models/user.Model.js';
import logger from '../config/logger.js';

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  let decoded;
  try {
    const token = header.split(' ')[1];
    decoded = verifyToken(token);
  } catch (error) {
    logger.error('Token verification failed', error);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }

  // get user from decoded token
  req.user = await User.findById(decoded.id).select('-password');
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, user not found');
  }
  next();
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Not authorized');
    }
    return next();
  };

export { protect, authorize };
