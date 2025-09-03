import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState, Token, TokenState } from '../types.js';

const initialState: TokenState = {
  watchlist: [],
  selectedTokens: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Load state from localStorage if available
const savedState = localStorage.getItem('tokenState');
if (savedState) {
  try {
    const parsedState = JSON.parse(savedState);
    initialState.watchlist = parsedState.watchlist || [];
    initialState.selectedTokens = parsedState.selectedTokens || [];
    initialState.lastUpdated = parsedState.lastUpdated || null;
  } catch (e) {
    console.error('Error loading state from localStorage', e);
  }
}

export const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setWatchlist: (state, action: PayloadAction<Token[]>) => {
      state.watchlist = action.payload;
      state.lastUpdated = new Date().toISOString();
      // Save to localStorage
      localStorage.setItem('tokenState', JSON.stringify({
        watchlist: state.watchlist,
        selectedTokens: state.selectedTokens,
        lastUpdated: state.lastUpdated,
      }));
    },
    addToWatchlist: (state, action: PayloadAction<Token[]>) => {
      // Filter out tokens that are already in the watchlist
      const newTokens = action.payload.filter(
        (token) => !state.watchlist.some((t) => t.id === token.id)
      );
      state.watchlist = [...state.watchlist, ...newTokens];
      state.lastUpdated = new Date().toISOString();
      // Save to localStorage
      localStorage.setItem('tokenState', JSON.stringify({
        watchlist: state.watchlist,
        selectedTokens: state.selectedTokens,
        lastUpdated: state.lastUpdated,
      }));
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter((token) => token.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
      // Save to localStorage
      localStorage.setItem('tokenState', JSON.stringify({
        watchlist: state.watchlist,
        selectedTokens: state.selectedTokens,
        lastUpdated: state.lastUpdated,
      }));
    },
    updateHoldings: (state, action: PayloadAction<{ id: string; holdings: number }>) => {
      const { id, holdings } = action.payload;
      const tokenIndex = state.watchlist.findIndex((token) => token.id === id);
      if (tokenIndex !== -1) {
        state.watchlist[tokenIndex].holdings = holdings;
        state.watchlist[tokenIndex].value = holdings * state.watchlist[tokenIndex].current_price;
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        localStorage.setItem('tokenState', JSON.stringify({
          watchlist: state.watchlist,
          selectedTokens: state.selectedTokens,
          lastUpdated: state.lastUpdated,
        }));
      }
    },
    updatePrices: (state, action: PayloadAction<Token[]>) => {
      // Update prices for tokens in the watchlist
      action.payload.forEach((updatedToken) => {
        const tokenIndex = state.watchlist.findIndex((token) => token.id === updatedToken.id);
        if (tokenIndex !== -1) {
          state.watchlist[tokenIndex] = {
            ...state.watchlist[tokenIndex],
            current_price: updatedToken.current_price,
            price_change_percentage_24h: updatedToken.price_change_percentage_24h,
            sparkline_in_7d: updatedToken.sparkline_in_7d,
            value: state.watchlist[tokenIndex].holdings * updatedToken.current_price,
          };
        }
      });
      state.lastUpdated = new Date().toISOString();
      // Save to localStorage
      localStorage.setItem('tokenState', JSON.stringify({
        watchlist: state.watchlist,
        selectedTokens: state.selectedTokens,
        lastUpdated: state.lastUpdated,
      }));
    },
    setSelectedTokens: (state, action: PayloadAction<string[]>) => {
      state.selectedTokens = action.payload;
    },
    clearSelectedTokens: (state) => {
      state.selectedTokens = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateHoldings,
  updatePrices,
  setSelectedTokens,
  clearSelectedTokens,
} = tokenSlice.actions;

// Selectors
export const selectWatchlist = (state: RootState) => state.tokens.watchlist;
export const selectLoading = (state: RootState) => state.tokens.loading;
export const selectError = (state: RootState) => state.tokens.error;
export const selectLastUpdated = (state: RootState) => state.tokens.lastUpdated;
export const selectSelectedTokens = (state: RootState) => state.tokens.selectedTokens;
export const selectPortfolioTotal = (state: RootState) =>
  state.tokens.watchlist.reduce((total, token) => total + token.value, 0);

export default tokenSlice.reducer;