import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed', { cause: error });
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
