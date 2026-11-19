import express from 'express';
import {
  getMenuItemsController,
  getAllMenuItemsController,
  createMenuItemController,
  updateMenuItemController,
  deleteMenuItemController,
  searchMenuItemsController,
} from '../controllers/menu.Controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Menu Items API endpoints
router
  .route('/')
  .get(getMenuItemsController)
  .post(protect, authorize('admin'), createMenuItemController);

router.route('/all').get(protect, authorize('admin'), getAllMenuItemsController);
router.route('/search').get(searchMenuItemsController);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateMenuItemController)
  .delete(protect, authorize('admin'), deleteMenuItemController);

export default router;
