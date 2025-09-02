// Token interface
interface Token {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: { price: number[] };
  holdings: number;
  value: number;
}

// Redux store types
interface TokenState {
  watchlist: Token[];
  selectedTokens: string[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

interface RootState {
  tokens: TokenState;
}

type AppDispatch = any;

// Export all types
export { Token, TokenState, RootState, AppDispatch };