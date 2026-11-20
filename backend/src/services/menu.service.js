import MenuItem from '../models/menuItem.Model.js';
import mongoose from 'mongoose';
import logger from '../config/logger.js';
import { getFromCache, setInCache, deleteFromCache, invalidateMenuCache } from './cach.service.js';

const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'isSpecial', 'available'];

// Get available menu items
export const getMenuItems = async () => {
  const cachedKey = 'menu:available';

  try {
    const cachedMenuItems = await getFromCache(cachedKey);
    if (cachedMenuItems) {
      logger.info('Returning menu items from cache');
      return cachedMenuItems;
    }

    const menuItems = await MenuItem.find({ available: true }).lean();
    await setInCache(cachedKey, menuItems, 3600);
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

// Search menu items by query string in name, description, or category

// Escapes special characters in a string for use in a regular expression
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchMenuItems = async query => {
  if (typeof query !== 'string' || !query.trim()) {
    return [];
  }
  const cachedKey = `menu:search:${query.toLowerCase()}`;
  // Limit the query to 100 characters to prevent overly broad searches
  try {
    const cachedMenuItems = await getFromCache(cachedKey);
    if (cachedMenuItems) {
      logger.info('Returning search results from cache');
      return cachedMenuItems;
    }

    const regex = new RegExp(escapeRegex(query.trim().slice(0, 100)), 'i');
    const menuItems = await MenuItem.find({
      available: true,
      $or: [{ name: regex }, { description: regex }, { category: regex }],
    })
      .select('-createdAt -updatedAt')
      .limit(50)
      .lean();

    await setInCache(cachedKey, menuItems, 3600);
    return menuItems;
  } catch (e) {
    logger.error(`Failed to search menu items: ${e.message}`);
    throw e;
  }
};

// Browse menu items with filtering and pagination
export const browseMenuItems = async ({ category, page, limit }) => {
  try {
    const cacheKey = `menu:browse:${category || 'all'}:${page}:${limit}`;
    
    // Try to get from cache
    const cached = await getFromCache(cacheKey);
    if (cached) {
      logger.info(`Browse results served from cache: ${cacheKey}`);
      return cached;
    }

    const filter = { available: true };
    if (category) filter.category = String(category);

    const items = await MenuItem.find(filter)
      .select('-createdAt -updatedAt')
      .sort({ price: 1 })
      .skip((page - 1) * limit)
      .limit(limit + 1)
      .lean();

    const result = {
      items: items.slice(0, limit),
      hasMore: items.length > limit,
    };

    // Cache for 30 minutes
    await setInCache(cacheKey, result, 1800);
    return result;
  } catch (e) {
    logger.error(`Failed to browse menu items: ${e.message}`);
    throw e;
  }
};
