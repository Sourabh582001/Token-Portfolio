import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  selectWatchlist,
  selectLoading,
  selectError,
  updateHoldings,
  removeFromWatchlist,
} from '../../redux/slices/tokenSlice';
import { getWatchlistData } from '../../services/coinGeckoService';
import AddTokenModal from '../modals/AddTokenModal';
import './WatchlistTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRotate } from '@fortawesome/free-solid-svg-icons';

const WatchlistTable = () => {
  const dispatch = useAppDispatch();
  const watchlist = useAppSelector(selectWatchlist);
  const isLoading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
  const [holdingsInput, setHoldingsInput] = useState<string>('');
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId) {
        const menuElement = document.querySelector('.popup-menu');
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setActiveMenuId(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);
  
  // Pagination settings
  const itemsPerPage = 5;
  const totalPages = Math.ceil(watchlist.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTokens = watchlist.slice(startIndex, endIndex);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  };
  
  // Handle holdings update
  const handleHoldingsUpdate = (id: string) => {
    const holdings = parseFloat(holdingsInput);
    if (!isNaN(holdings) && holdings >= 0) {
      dispatch(updateHoldings({ id, holdings }));
      setEditingTokenId(null);
      setHoldingsInput('');
    }
  };
  
  // Handle refresh prices
  const handleRefreshPrices = async () => {
    try {
      const updatedData = await getWatchlistData(watchlist);
      // This would typically be dispatched through a thunk action
      // For simplicity, we're calling the API directly here
      console.log('Updated data:', updatedData);
    } catch (error) {
      console.error('Error refreshing prices:', error);
    }
  };
  
  // Render sparkline chart using SVG
  const renderSparkline = (prices: number[]) => {
    if (!prices || prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1; // Avoid division by zero
    
    const width = 120;
    const height = 40;
    const points = prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((price - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    // Determine color based on trend
    const isPositive = prices[0] <= prices[prices.length - 1];
    const strokeColor = isPositive ? '#4caf50' : '#f44336';
    
    return (
      <svg width={width} height={height} className="sparkline">
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
        />
      </svg>
    );
  };
  
  // If loading
  if (isLoading) {
    return <div className="loading-state">Loading watchlist data...</div>;
  }
  
  // If error
  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }
  
  // If empty watchlist
  if (watchlist.length === 0) {
    return (
      <div className="empty-state">
        <p>Your watchlist is empty. Add tokens to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h2>Watchlist</h2>
        <div className="watchlist-actions">
          <button className="refresh-button" onClick={handleRefreshPrices}>
            <FontAwesomeIcon icon={faRotate} /> Refresh Prices
          </button>
          <button className="add-token-button" onClick={() => setIsAddTokenModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} /> Add Token
          </button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="watchlist-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Price</th>
              <th>24h %</th>
              <th>Sparkline (7d)</th>
              <th>Holdings</th>
              <th>Value</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentTokens.map((token) => (
              <tr key={token.id}>
                <td className="token-cell">
                  <img src={token.image} alt={token.name} className="token-icon" />
                  <div className="token-info">
                    <div className="token-name">{token.name}</div>
                    <div className="token-symbol">{token.symbol}</div>
                  </div>
                </td>
                <td>{formatCurrency(token.current_price)}</td>
                <td className={token.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}>
                  {token.price_change_percentage_24h?.toFixed(2)}%
                </td>
                <td className="sparkline-cell">
                  {renderSparkline(token.sparkline_in_7d?.price || [])}
                </td>
                <td className="holdings-cell">
                  {editingTokenId === token.id ? (
                    <div className="holdings-edit">
                      <input
                        type="number"
                        value={holdingsInput}
                        placeholder='Select'
                        onChange={(e) => setHoldingsInput(e.target.value)}
                        min="0"
                        step="0.000001"
                      />
                      <button onClick={() => handleHoldingsUpdate(token.id)}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="holdings-display" onClick={() => {
                      setEditingTokenId(token.id);
                      setHoldingsInput(token.holdings.toString());
                    }}>
                      {token.holdings}
                    </div>
                  )}
                </td>
                <td>{formatCurrency(token.value)}</td>
                <td>
                  <div className="three-dots-menu">
                    <button 
                      className="three-dots-button"
                      onClick={() => setActiveMenuId(activeMenuId === token.id ? null : token.id)}
                    >
                      ⋮
                    </button>
                    {activeMenuId === token.id && (
                      <div className="popup-menu">
                        <button 
                          className="popup-menu-item"
                          onClick={() => {
                            setEditingTokenId(token.id);
                            setHoldingsInput(token.holdings.toString());
                            setActiveMenuId(null);
                          }}
                        >
                          Edit Holdings
                        </button>
                        <button 
                          className="popup-menu-item"
                          onClick={() => {
                            dispatch(removeFromWatchlist(token.id));
                            setActiveMenuId(null);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
      
      <AddTokenModal
        isOpen={isAddTokenModalOpen}
        onClose={() => setIsAddTokenModalOpen(false)}
      />
    </div>
  );
};

export default WatchlistTable;