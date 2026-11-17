import express from 'express';
import {
  getMenuItems,
  getAllMenuItems,
  setMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Menu Items API endpoints
router.route('/').get(getMenuItems).post(protect, authorize('admin'), setMenuItem);
router.route('/all').get(protect, authorize('admin'), getAllMenuItems);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateMenuItem)
  .delete(protect, authorize('admin'), deleteMenuItem);

export default router;
