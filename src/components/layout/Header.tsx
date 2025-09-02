import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>Token Portfolio</h1>
          </div>
          
          <div className="desktop-nav">
            <ConnectButton />
          </div>
          
          <div className="mobile-menu-toggle">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="mobile-nav">
            <ConnectButton />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;