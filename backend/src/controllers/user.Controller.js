import { authenticateUser, registerUser, getUserById } from '../services/user.service.js';
import { handleAsyncErrors } from '../middleware/errorHandler.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUserController = handleAsyncErrors(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await registerUser({ name, email, password });

  res.status(201).json(user);
});

// @desc    Authenticate a user (login)
// @route   POST /api/users/login
// @access  Public
const loginUserController = handleAsyncErrors(async (req, res) => {
  const { email, password } = req.body;

  const user = await authenticateUser({ email, password });

  res.status(200).json(user);
});

// @desc    Get authenticated user profile
// @route   GET /api/users/me
// @access  Private
const getMeController = handleAsyncErrors(async (req, res) => {
  const user = await getUserById(req.user._id);

  res.status(200).json(user);
});

export { registerUserController, loginUserController, getMeController };
