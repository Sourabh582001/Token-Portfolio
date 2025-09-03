import { ConnectButton } from '@rainbow-me/rainbowkit';
import './Header.css';
import walletIcon from '../../assets/images/wallet.svg';
import tokenPortfolioIcon from '../../assets/images/token-portfolio.svg';

const Header = () => {

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img src={tokenPortfolioIcon} alt="Token Portfolio" className="logo-icon" />
            <h1>Token Portfolio</h1>
          </div>
          
          <div className="desktop-nav">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button 
                            onClick={openConnectModal} 
                            className="connect-wallet-button"
                          >
                            <img src={walletIcon} alt="Wallet" className="wallet-icon" />
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <div className="connected-container">
                          <button onClick={openChainModal} className="chain-button">
                            {chain.name}
                          </button>

                          <button onClick={openAccountModal} className="account-button">
                            {account.displayName}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
          
          <div className="mobile-menu-toggle">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button 
                            onClick={openConnectModal} 
                            className="connect-wallet-button mobile-connect-button"
                          >
                            <img src={walletIcon} alt="Wallet" className="wallet-icon" />
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <div className="connected-container">
                          <button onClick={openChainModal} className="chain-button">
                            {chain.name}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
        

      </div>
    </header>
  );
};

export default Header;