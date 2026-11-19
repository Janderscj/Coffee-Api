import { handleAsyncErrors } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import {
  createMenuItem,
  searchMenuItems,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItems,
  updateMenuItem,
} from '../services/menu.service.js';

// @desc Get available menu items
// @route GET /api/menu
// @access Public
const getMenuItemsController = handleAsyncErrors(async (req, res) => {
  const menuItems = await getMenuItems();
  res.status(200).json(menuItems);
});

// @desc Get all menu items including disabled ones
// @route GET /api/menu/all
// @access Public
const getAllMenuItemsController = handleAsyncErrors(async (req, res) => {
  const menuItems = await getAllMenuItems();
  res.status(200).json(menuItems);
});

// @desc Create a new menu item
// @route POST /api/menu
// @access Private
const createMenuItemController = handleAsyncErrors(async (req, res) => {
  const menuItem = await createMenuItem(req.body);
  logger.info(`Menu item created: "${menuItem.name}" by user ${req.user.id}`);
  res.status(201).json(menuItem);
});

// @desc Update a menu item by ID
// @route PUT /api/menu/:id
// @access Private
const updateMenuItemController = handleAsyncErrors(async (req, res) => {
  const updatedItem = await updateMenuItem(req.params.id, req.body);
  logger.info(`Menu item updated: "${updatedItem.name}" by user ${req.user.id}`);
  res.status(200).json(updatedItem);
});

// @desc Delete a menu item by ID
// @route DELETE /api/menu/:id
// @access Private
const deleteMenuItemController = handleAsyncErrors(async (req, res) => {
  const menuItem = await deleteMenuItem(req.params.id);
  logger.info(`Deleted Menu Item: "${menuItem.name}" by user ${req.user.id}`);
  res.status(200).json({ message: `Deleted Menu Item ${req.params.id}`, menuItem });
});

// @desc Search menu items by query
// @route GET /api/menu/search
// @access Public
const searchMenuController = handleAsyncErrors(async (req, res) => {
  const { query } = req.query;
  const menuItems = await searchMenuItems(query);
  res.status(200).json(menuItems);
});

export {
  getMenuItemsController,
  getAllMenuItemsController,
  createMenuItemController,
  updateMenuItemController,
  deleteMenuItemController,
  searchMenuController,
};
