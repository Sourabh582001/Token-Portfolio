import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './slices/tokenSlice';
import type { RootState, AppDispatch } from './types.js';

// Create the store
export const store = configureStore({
  reducer: {
    tokens: tokenReducer,
  },
});

// Re-export types
export type { RootState, AppDispatch };