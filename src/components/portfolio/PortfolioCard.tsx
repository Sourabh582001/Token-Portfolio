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
      const labels = tokensWithHoldings.map((token) => `${token.name},${token.symbol}`);
      const data = tokensWithHoldings.map((token) => token.value);

      // Generate colors based on token index
      const backgroundColors = tokensWithHoldings.map((_, index) => {
        const hue = (index * 137.5) % 360; // Golden angle approximation for good distribution
        return `hsl(${hue}, 70%, 60%)`;
      });

      // Removed unused borderColors variable

      setChartData({
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: ['#ffffff'],
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
        <div>
          <h2 className='portfolio-title'>Portfolio Total</h2>
          <div className="portfolio-value">{formatCurrency(portfolioTotal)}</div>
        </div>
        <div className="last-updated">
          Last updated: {formattedLastUpdated}
        </div>
      </div>
      <div className="portfolio-chart">
        <h2 className='portfolio-title'>Portfolio Total</h2>
        {chartData && (
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false, // ❌ disable default legend
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.label || '';
                      const value = context.raw as number;
                      const percentage = ((value / portfolioTotal) * 100).toFixed(2);
                      return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    },
                  },
                },
              },
              cutout: '60%',
            }}
          />
        )}
      </div>
      {/*  Custom Legend */}
      {chartData && chartData.labels && (
        <div className="custom-legend">
          {chartData.labels.map((label: string, index: number) => {
            const value = chartData.datasets[0].data[index];
            const percentage = ((value / portfolioTotal) * 100).toFixed(1);
            const color = chartData.datasets[0].backgroundColor[index];

            // Split name and symbol if your label is "Bitcoin,BTC"
            const [name, symbol] = label.split(",");

            return (
              <div key={index} className="legend-item">
                <span className="legend-label" style={{ color }}>
                  {name} ({symbol})
                </span>
                <span className="legend-value">{percentage}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioCard;