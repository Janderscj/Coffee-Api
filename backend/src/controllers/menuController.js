import logger from '../config/logger.js';
import MenuItem from '../models/menuItemModel.js';
import mongoose from 'mongoose';

const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'isSpecial', 'available'];

const pickAllowed = body =>
  Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)));

const assertValidId = (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Menu item not found');
  }
};
// @desc    Get  available menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  const menuItems = await MenuItem.find({ available: true });
  res.status(200).json(menuItems);
};
// @desc    Get all menu items
// @route   GET /api/menu/all
// @access  Public
const getAllMenuItems = async (req, res) => {
  const menuItems = await MenuItem.find();
  res.status(200).json(menuItems);
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private (Admin only)
const setMenuItem = async (req, res) => {
  if (!req.body.name || req.body.price == null) {
    res.status(400);
    throw new Error('Please add a name and price');
  }
  const menuItem = await MenuItem.create(pickAllowed(req.body));
  logger.info(`Menu item created: "${menuItem.name}" by user ${req.user.id}`);
  res.status(201).json(menuItem);
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private
const updateMenuItem = async (req, res) => {
  assertValidId(req, res);
  const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, pickAllowed(req.body), {
    new: true,
    runValidators: true,
  });
  if (!updatedItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  logger.info(`Menu item updated: "${updatedItem.name}" by user ${req.user.id}`);
  res.status(200).json(updatedItem);
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin only)
const deleteMenuItem = async (req, res) => {
  assertValidId(req, res);
  const menuItem = await MenuItem.findById(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  await MenuItem.findByIdAndDelete(req.params.id);
  logger.info(`Deleted Menu Item: "${menuItem.name}" by user ${req.user.id}`);
  res.status(200).json({ message: `Deleted Menu Item ${req.params.id}`, menuItem });
};

export { getMenuItems, getAllMenuItems, setMenuItem, updateMenuItem, deleteMenuItem };
