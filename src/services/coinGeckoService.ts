import axios from 'axios';
import { Token } from '../redux/types.js';

const API_URL = 'https://api.coingecko.com/api/v3';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  params: {
    // Add your API key here if you have one
    // x_cg_pro_api_key: 'YOUR_API_KEY',
  },
});

// Get trending tokens
export const getTrendingTokens = async () => {
  try {
    const response = await api.get('/search/trending');
    return response.data.coins.map((item: any) => item.item);
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    throw error;
  }
};

// Search tokens by query
export const searchTokens = async (query: string) => {
  try {
    const response = await api.get('/search', {
      params: { query },
    });
    return response.data.coins;
  } catch (error) {
    console.error('Error searching tokens:', error);
    throw error;
  }
};

// Get token details by IDs
export const getTokensByIds = async (ids: string[]) => {
  try {
    if (ids.length === 0) return [];
    
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: ids.join(','),
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: true,
        price_change_percentage: '24h',
      },
    });
    
    return response.data.map((token: any) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol.toUpperCase(),
      image: token.image,
      current_price: token.current_price,
      price_change_percentage_24h: token.price_change_percentage_24h,
      sparkline_in_7d: token.sparkline_in_7d,
      holdings: 0,
      value: 0,
    }));
  } catch (error) {
    console.error('Error fetching tokens by IDs:', error);
    throw error;
  }
};

// Get market data for tokens in watchlist
export const getWatchlistData = async (tokens: Token[]) => {
  try {
    const ids = tokens.map((token) => token.id);
    if (ids.length === 0) return [];
    
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: ids.join(','),
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: true,
        price_change_percentage: '24h',
      },
    });
    
    return response.data.map((token: any) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol.toUpperCase(),
      image: token.image,
      current_price: token.current_price,
      price_change_percentage_24h: token.price_change_percentage_24h,
      sparkline_in_7d: token.sparkline_in_7d,
    }));
  } catch (error) {
    console.error('Error fetching watchlist data:', error);
    throw error;
  }
};