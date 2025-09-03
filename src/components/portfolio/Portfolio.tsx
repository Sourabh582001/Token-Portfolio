import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { setLoading, setError, setWatchlist } from '../../redux/slices/tokenSlice';
import { getTokensByIds } from '../../services/coinGeckoService';
import PortfolioCard from './PortfolioCard';
import WatchlistTable from './WatchlistTable';
import AddTokenModal from '../modals/AddTokenModal';
import './Portfolio.css';

const Portfolio = () => {
  const dispatch = useAppDispatch();
  
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // This would typically be done through a thunk action
        // For simplicity, we're simulating it here
        dispatch(setLoading(true));
        
        // Get saved token IDs from localStorage
        const savedState = localStorage.getItem('tokenState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          if (parsedState.watchlist && parsedState.watchlist.length > 0) {
            const tokenIds = parsedState.watchlist.map((token: any) => token.id);
            const tokens = await getTokensByIds(tokenIds);
            
            // Restore holdings from saved state
            const tokensWithHoldings = tokens.map((token: { id: string; current_price: number }) => {
              const savedToken = parsedState.watchlist.find((t: any) => t.id === token.id);
              return {
                ...token,
                holdings: savedToken ? savedToken.holdings : 0,
                value: savedToken ? savedToken.holdings * token.current_price : 0,
              };
            });
            
            dispatch(setWatchlist(tokensWithHoldings));
          }
        }
        
        dispatch(setLoading(false));
      } catch (error) {
        console.error('Error loading initial data:', error);
        dispatch(setError('Failed to load portfolio data'));
        dispatch(setLoading(false));
      }
    };
    
    loadInitialData();
  }, [dispatch]);
  
  return (
    <div className="portfolio-page">
      
      <PortfolioCard />
      
      <WatchlistTable />
      
      <AddTokenModal
        isOpen={isAddTokenModalOpen}
        onClose={() => setIsAddTokenModalOpen(false)}
      />
    </div>
  );
};

export default Portfolio;