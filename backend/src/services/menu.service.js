import MenuItem from '../models/menuItem.Model.js';
import mongoose from 'mongoose';
import logger from '../config/logger.js';

const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'isSpecial', 'available'];

// Gets available menu items (not hidden/disabled)
export const getMenuItems = async () => {
  try {
    const menuItems = await MenuItem.find({ available: true });
    return menuItems;
  } catch (e) {
    logger.error(`Failed to get menu items: ${e.message}`);
    throw e;
  }
};

// Creates a new menu item with allowed fields. Requires name and price.
export const createMenuItem = async body => {
  try {
    if (!body.name || body.price == null) {
      throw new Error('Please add a name and price');
    }

    const allowedData = Object.fromEntries(
      Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key))
    );

    const menuItem = await MenuItem.create(allowedData);
    logger.info(`Menu item created: "${menuItem.name}"`);
    return menuItem;
  } catch (e) {
    logger.error(`Failed to create menu item: ${e.message}`);
    throw e;
  }
};

// Retrieves all menu items including disabled ones
export const getAllMenuItems = async () => {
  try {
    const menuItems = await MenuItem.find();
    return menuItems;
  } catch (e) {
    logger.error(`Failed to get all menu items: ${e.message}`);
    throw e;
  }
};

// Updates a menu item by ID with allowed fields
export const updateMenuItem = async (id, body) => {
  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error('Menu item not found');
    }

    const allowedData = Object.fromEntries(
      Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key))
    );

    const updatedItem = await MenuItem.findByIdAndUpdate(id, allowedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      throw new Error('Menu item not found');
    }

    logger.info(`Menu item updated: "${updatedItem.name}"`);
    return updatedItem;
  } catch (e) {
    logger.error(`Failed to update menu item: ${e.message}`);
    throw e;
  }
};

// Deletes a menu item by ID
export const deleteMenuItem = async id => {
  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error('Menu item not found');
    }

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    await MenuItem.findByIdAndDelete(id);
    logger.info(`Deleted Menu Item: "${menuItem.name}"`);
    return menuItem;
  } catch (e) {
    logger.error(`Failed to delete menu item: ${e.message}`);
    throw e;
  }
};

// Searches for menu items by query string in name, description, or category
export const searchMenuItems = async query => {
  try {
    const regex = new RegExp(query, 'i');
    const menuItems = await MenuItem.find({
      $or: [{ name: regex }, { description: regex }, { category: regex }],
    });
    return menuItems;
  } catch (e) {
    logger.error(`Failed to search menu items: ${e.message}`);
    throw e;
  }
};
