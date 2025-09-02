import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './slices/tokenSlice';
import { RootState, AppDispatch } from './types.js';

// Create the store
export const store = configureStore({
  reducer: {
    tokens: tokenReducer,
  },
});

// Re-export types
export { RootState, AppDispatch };