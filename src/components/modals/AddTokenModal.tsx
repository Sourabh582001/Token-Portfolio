import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  addToWatchlist,
  setSelectedTokens,
  clearSelectedTokens,
  selectSelectedTokens,
} from '../../redux/slices/tokenSlice';
import { searchTokens, getTrendingTokens, getTokensByIds } from '../../services/coinGeckoService';
import './AddTokenModal.css';

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TokenSearchResult {
  id: string;
  name: string;
  symbol: string;
  large?: string;
  thumb?: string;
  market_cap_rank?: number;
}

const AddTokenModal = ({ isOpen, onClose }: AddTokenModalProps) => {
  const dispatch = useAppDispatch();
  const selectedTokenIds = useAppSelector(selectSelectedTokens);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<TokenSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trending tokens on mount
  useEffect(() => {
    if (isOpen) {
      fetchTrendingTokens();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      dispatch(clearSelectedTokens());
    }
  }, [isOpen, dispatch]);

  const fetchTrendingTokens = async () => {
    try {
      setIsLoading(true);
      const trending = await getTrendingTokens();
      setTrendingTokens(trending);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      setError('Failed to fetch trending tokens');
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const results = await searchTokens(query);
      setSearchResults(results.slice(0, 10)); // Limit to top 10 results
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching tokens:', error);
      setError('Failed to search tokens');
      setIsLoading(false);
    }
  };

  // Debounce search as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTokenSelect = (tokenId: string) => {
    if (selectedTokenIds.includes(tokenId)) {
      dispatch(setSelectedTokens(selectedTokenIds.filter(id => id !== tokenId)));
    } else {
      dispatch(setSelectedTokens([...selectedTokenIds, tokenId]));
    }
  };

  const handleAddToWatchlist = async () => {
    if (selectedTokenIds.length === 0) return;

    try {
      setIsLoading(true);
      const tokensToAdd = await getTokensByIds(selectedTokenIds);
      dispatch(addToWatchlist(tokensToAdd));
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error adding tokens to watchlist:', error);
      setError('Failed to add tokens to watchlist');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayTokens = searchQuery ? searchResults : trendingTokens;

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Search bar (full width, top) */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search tokens (e.g., ETH, SOL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Token list */}
        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <div className="token-list">
            <h3>{searchQuery ? 'Search Results' : 'Trending'}</h3>
            
            {displayTokens.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? 'No results found' : 'No trending tokens available'}
              </div>
            ) : (
              displayTokens.map((token) => (
                <div
                  key={token.id}
                  className={`token-item ${selectedTokenIds.includes(token.id) ? 'selected' : ''}`}
                  onClick={() => handleTokenSelect(token.id)}
                >
                  <div className="token-icon">
                    <img src={token.thumb || token.large} alt={token.name} />
                  </div>
                  <div className="token-details">
                    <div className="token-name">{token.name}</div>
                    <div className="token-symbol">({token.symbol?.toUpperCase()})</div>
                  </div>
                  <input
                    type="radio"
                    checked={selectedTokenIds.includes(token.id)}
                    onChange={() => { }}
                    readOnly
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer with Add button */}
        <div className="modal-footer">
          <button
            className="add-button"
            disabled={selectedTokenIds.length === 0 || isLoading}
            onClick={handleAddToWatchlist}
          >
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );

};

export default AddTokenModal;