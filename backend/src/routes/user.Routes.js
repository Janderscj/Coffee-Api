import express from 'express';
import { registerUserController, loginUserController, getMeController } from '../controllers/user.Controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// User API endpoints
router.post('/', registerUserController);
router.post('/login', loginUserController);
router.get('/me', protect, getMeController);

export default router;

