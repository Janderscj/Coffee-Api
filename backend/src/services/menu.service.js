import MenuItem from '../models/menuItem.Model.js';
import mongoose from 'mongoose';
import logger from '../config/logger.js';
import {
  cacheEnabled,
  VERSION_KEY,
  TTL_SECONDS,
  bumpMenuCache,
  withMenuCache,
} from '../utils/menuCache.js';

const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'isSpecial', 'available'];

// Get available menu items
export const getMenuItems = async () => {
  return await withMenuCache(['available'], async () => {
    return await MenuItem.find({ available: true }).lean();
  });
};

// Creates a new menu item with allowed fields. Requires name and price.
export const createMenuItem = async body => {
  try {
    if (!body.name || body.price == null) {
      const error = new Error('Please add a name and price');
      error.statusCode = 400;
      throw error;
    }

    const allowedData = Object.fromEntries(
      Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key))
    );

    const menuItem = await MenuItem.create(allowedData);
    await bumpMenuCache();
    logger.info(`Menu item created: "${menuItem.name}"`);
    return menuItem;
  } catch (e) {
    logger.error(`Failed to create menu item: ${e.message}`);
    throw e;
  }
};

// Retrieves all menu items including unavailable ones
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
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      throw error;
    }

    const allowedData = Object.fromEntries(
      Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key))
    );

    const updatedItem = await MenuItem.findByIdAndUpdate(id, allowedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      throw error;
    }

    await bumpMenuCache();
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
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      throw error;
    }

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      throw error;
    }

    await MenuItem.findByIdAndDelete(id);
    await bumpMenuCache();
    logger.info(`Deleted Menu Item: "${menuItem.name}"`);
    return menuItem;
  } catch (e) {
    logger.error(`Failed to delete menu item: ${e.message}`);
    throw e;
  }
};

// Browse menu items with filtering and pagination
export const browseMenuItems = query => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 50);
  const category = query.category || '';
  const q = (query.q || '').trim().toLowerCase().slice(0, 50);

  return withMenuCache(['browse', category, q, page, limit], async () => {
    const filter = { available: true };
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const items = await MenuItem.find(filter)
      .select('-__v -createdAt -updatedAt')
      .sort({ price: 1 })
      .skip((page - 1) * limit)
      .limit(limit + 1)
      .lean();

    return { items: items.slice(0, limit), page, limit, hasMore: items.length > limit };
  });
};
