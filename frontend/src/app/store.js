import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import menuReducer from '../features/menu/menuSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
  },
  // eslint-disable-next-line no-undef
  devTools: window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
});
