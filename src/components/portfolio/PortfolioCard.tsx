import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useAppSelector } from '../../redux/hooks';
import { selectPortfolioTotal, selectWatchlist, selectLastUpdated } from '../../redux/slices/tokenSlice';
import './PortfolioCard.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioCard = () => {
  const watchlist = useAppSelector(selectWatchlist);
  const portfolioTotal = useAppSelector(selectPortfolioTotal);
  const lastUpdated = useAppSelector(selectLastUpdated);
  const [chartData, setChartData] = useState<any>(null);

  // Format the last updated timestamp
  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString()
    : 'Never';

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Prepare chart data whenever watchlist changes
  useEffect(() => {
    if (watchlist.length > 0) {
      // Filter out tokens with no holdings
      const tokensWithHoldings = watchlist.filter((token) => token.holdings > 0);
      
      // If no tokens have holdings, show empty chart
      if (tokensWithHoldings.length === 0) {
        setChartData({
          labels: ['No Holdings'],
          datasets: [
            {
              data: [1],
              backgroundColor: ['#e0e0e0'],
              borderColor: ['#ffffff'],
              borderWidth: 1,
            },
          ],
        });
        return;
      }
      
      // Prepare data for chart
      const labels = tokensWithHoldings.map((token) => token.symbol);
      const data = tokensWithHoldings.map((token) => token.value);
      
      // Generate colors based on token index
      const backgroundColors = tokensWithHoldings.map((_, index) => {
        const hue = (index * 137.5) % 360; // Golden angle approximation for good distribution
        return `hsl(${hue}, 70%, 60%)`;
      });
      
      const borderColors = backgroundColors.map(color => color.replace('60%', '50%'));
      
      setChartData({
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      });
    } else {
      // Empty chart when no tokens
      setChartData({
        labels: ['No Data'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e0e0e0'],
            borderColor: ['#ffffff'],
            borderWidth: 1,
          },
        ],
      });
    }
  }, [watchlist]);

  return (
    <div className="portfolio-card">
      <div className="portfolio-info">
        <h2>Portfolio Total</h2>
        <div className="portfolio-value">{formatCurrency(portfolioTotal)}</div>
        <div className="last-updated">
          Last updated: {formattedLastUpdated}
        </div>
      </div>
      <div className="portfolio-chart">
        {chartData && (
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: '#ffffff',
                    usePointStyle: true,
                    padding: 20,
                    font: {
                      size: 12,
                    },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw as number;
                      const percentage = ((value / portfolioTotal) * 100).toFixed(2);
                      return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    },
                  },
                },
              },
              cutout: '70%',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioCard;