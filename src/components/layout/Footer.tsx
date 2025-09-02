import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Token Portfolio. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;