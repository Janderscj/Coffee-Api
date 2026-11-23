import express from 'express';
import {
  getMenuItemsController,
  getAllMenuItemsController,
  createMenuItemController,
  updateMenuItemController,
  deleteMenuItemController,
  browseMenuItemsController,
} from '../controllers/menu.Controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Browse menu items with filtering and pagination
// GET /api/menu/browse
// Public access
router.get('/browse', browseMenuItemsController);

// Menu Items API endpoints
router
  .route('/')
  .get(getMenuItemsController)
  .post(protect, authorize('admin'), createMenuItemController);

router.route('/all').get(protect, authorize('admin'), getAllMenuItemsController);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateMenuItemController)
  .delete(protect, authorize('admin'), deleteMenuItemController);

export default router;
