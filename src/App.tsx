import { Provider } from 'react-redux';
import { store } from './redux/store';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './utils/walletConfig';
import Layout from './components/layout/Layout';
import Portfolio from './components/portfolio/Portfolio';
import './App.css';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <Layout>
              <Portfolio />
            </Layout>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Provider>
  );
}

export default App;
