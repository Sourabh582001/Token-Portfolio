// Token interface
export interface Token {
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
export interface TokenState {
  watchlist: Token[];
  selectedTokens: string[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface RootState {
  tokens: TokenState;
}

export type AppDispatch = any;