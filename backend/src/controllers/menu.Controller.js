import { handleAsyncErrors } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import {
  createMenuItem,
  browseMenuItems,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItems,
  updateMenuItem,
} from '../services/menu.service.js';

// @desc Get available menu items
// @route GET /api/menu
// @access Public
export const getMenuItemsController = handleAsyncErrors(async (req, res) => {
  const { json, cache } = await getMenuItems();
  res.set('X-Cache', cache).status(200).type('json').send(json);
});

// @desc Get all menu items including disabled ones
// @route GET /api/menu/all
// @access Public
export const getAllMenuItemsController = handleAsyncErrors(async (req, res) => {
  const menuItems = await getAllMenuItems();
  res.status(200).json(menuItems);
});

// @desc Create a new menu item
// @route POST /api/menu
// @access Private
export const createMenuItemController = handleAsyncErrors(async (req, res) => {
  const menuItem = await createMenuItem(req.body);
  logger.info(`Menu item created: "${menuItem.name}" by user ${req.user.id}`);
  res.status(201).json(menuItem);
});

// @desc Update a menu item by ID
// @route PUT /api/menu/:id
// @access Private
export const updateMenuItemController = handleAsyncErrors(async (req, res) => {
  const updatedItem = await updateMenuItem(req.params.id, req.body);
  logger.info(`Menu item updated: "${updatedItem.name}" by user ${req.user.id}`);
  res.status(200).json(updatedItem);
});

// @desc Delete a menu item by ID
// @route DELETE /api/menu/:id
// @access Private
export const deleteMenuItemController = handleAsyncErrors(async (req, res) => {
  const menuItem = await deleteMenuItem(req.params.id);
  logger.info(`Deleted Menu Item: "${menuItem.name}" by user ${req.user.id}`);
  res.status(200).json({ message: `Deleted Menu Item ${req.params.id}`, menuItem });
});

// @desc    Browse menu items with filtering and pagination
// @route   GET /api/menu/browse
// @access  Public
export const browseMenuItemsController = handleAsyncErrors(async (req, res) => {
  const { json, cache } = await browseMenuItems(req.query);
  res.set('X-Cache', cache).status(200).type('json').send(json);
});
