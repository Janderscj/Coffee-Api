import axios from 'axios';

const API_URL = '/api/menu/';

// Get menu items
const getMenu = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get all menu items (admin)
const getAllMenu = async token => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'all', config);
  return response.data;
};

// Create new menu item
const createMenuItem = async (itemData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, itemData, config);
  return response.data;
};

// Delete menu item
const deleteMenuItem = async (menuItemId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + menuItemId, config);
  return response.data;
};

// Update menu item
const updateMenuItem = async (menuItemId, itemData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + menuItemId, itemData, config);
  return response.data;
};
const menuService = {
  createMenuItem,
  getMenu,
  getAllMenu,
  deleteMenuItem,
  updateMenuItem,
};
export default menuService;
