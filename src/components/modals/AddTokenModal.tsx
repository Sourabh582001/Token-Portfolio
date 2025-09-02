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
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const results = await searchTokens(searchQuery);
      setSearchResults(results.slice(0, 10)); // Limit to top 10 results
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching tokens:', error);
      setError('Failed to search tokens');
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Token</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        
        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <div className="token-list">
            <h3>{searchQuery ? 'Search Results' : 'Trending Tokens'}</h3>
            
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
                  <div className="token-radio">
                    <input
                      type="radio"
                      checked={selectedTokenIds.includes(token.id)}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>
                  <div className="token-icon">
                    <img src={token.thumb || token.large} alt={token.name} />
                  </div>
                  <div className="token-details">
                    <div className="token-name">{token.name}</div>
                    <div className="token-symbol">{token.symbol?.toUpperCase()}</div>
                  </div>
                  {token.market_cap_rank && (
                    <div className="token-rank">#{token.market_cap_rank}</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        
        <div className="modal-footer">
          <button
            className="add-button"
            disabled={selectedTokenIds.length === 0 || isLoading}
            onClick={handleAddToWatchlist}
          >
            Add to Watchlist ({selectedTokenIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTokenModal;