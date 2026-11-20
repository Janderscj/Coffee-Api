import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import menuService from './menuService.js';

const initialState = {
  items: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const getErrorMessage = error =>
  (error.response && error.response.data && error.response.data.message) ||
  error.message ||
  error.toString();

// Public: no token needed
export const getMenu = createAsyncThunk('menu/getPublic', async (_, thunkAPI) => {
  try {
    return await menuService.getMenu();
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

// Admin: includes unavailable items
export const getAllMenu = createAsyncThunk('menu/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await menuService.getAllMenu(token);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const createMenuItem = createAsyncThunk('menu/create', async (itemData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await menuService.createMenuItem(itemData, token);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const updateMenuItem = createAsyncThunk(
  'menu/update',
  async ({ id, itemData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await menuService.updateMenuItem(id, itemData, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteMenuItem = createAsyncThunk('menu/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await menuService.deleteMenuItem(id, token);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(getMenu.pending, state => {
        state.isLoading = true;
      })
      .addCase(getMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = action.payload;
      })
      .addCase(getMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(getAllMenu.pending, state => {
        state.isLoading = true;
      })
      .addCase(getAllMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = action.payload;
      })
      .addCase(getAllMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(createMenuItem.pending, state => {
        state.isLoading = true;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items.push(action.payload);
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(updateMenuItem.pending, state => {
        state.isLoading = true;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = state.items.map(item =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(deleteMenuItem.pending, state => {
        state.isLoading = true;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = state.items.filter(item => item._id !== action.payload.menuItem._id);
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = menuSlice.actions;
export default menuSlice.reducer;
