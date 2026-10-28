import { Link } from 'react-router-dom';
import { useInstallApp } from './InstallApp';

const footerGroups = [
  { title: 'Skincare', items: ['Cleanser', 'Creams', 'Face Cream', 'Face Wash', 'Serum', 'Toner'] },
  { title: 'Body & Hair', items: ['Body Lotions', 'Body Wash', 'Hair Care', 'Oil', 'Scrub', 'Soap'] },
  { title: 'Makeup & Fragrance', items: ['Cosmetics', 'Fragrances', 'Set'] },
  { title: 'Jewellery & More', items: ['Bags', 'Earrings', 'Shoes'] },
];

export default function Footer() {
  const { install, installed } = useInstallApp();

  return (
    <footer className="store-footer">
      <div className="store-footer-grid">
        <section className="store-footer-brand">
          <Link to="/" aria-label="Des Collection LTD home"><img src="/logo.png" alt="Des Collection LTD" /></Link>
          <p className="store-footer-brand-name">Des Collection LTD</p>
          <p className="store-footer-tagline">-Online Collection-</p>
          <address>
            <a href="tel:+447440248472">Call: +44 7440 248472</a>
            <a href="mailto:sales@descollection.co.uk">Email: sales@descollection.co.uk</a>
            <span>312 Moston Lane, Manchester M40 9WB</span>
          </address>
          <h3>Information</h3>
          <nav className="store-footer-links">
            <Link to="/about">About us</Link>
            <Link to="/faq">Frequently asked questions</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/terms">Terms &amp; conditions</Link>
            <Link to="/privacy">Privacy notice</Link>
            <Link to="/returns-refunds">Returns and refunds</Link>
            <Link to="/shipping">Shipping policy</Link>
            <Link to="/disclaimer">Disclaimer</Link>
            <Link to="/brands">Brands</Link>
          </nav>
          <button className="footer-install-button" type="button" onClick={install} disabled={installed}>
            {installed ? 'App installed' : 'Install app'}
          </button>
        </section>

        {footerGroups.map((group) => (
          <details className="store-footer-group" key={group.title}>
            <summary>{group.title}</summary>
            <nav>
              {group.items.map((item) => <Link key={item} to={`/category/${encodeURIComponent(item)}`}>{item}</Link>)}
            </nav>
          </details>
        ))}
      </div>
      <section className="footer-payment-methods" aria-label="Secure payment options available at checkout">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4.5 5v6.1c0 5 3.2 9.2 7.5 10.9 4.3-1.7 7.5-5.9 7.5-10.9V5L12 2Zm0 3.1 4.5 1.8v4.2c0 3.5-1.8 6.6-4.5 8.2-2.7-1.6-4.5-4.7-4.5-8.2V6.9L12 5.1Zm-.9 3.2v3h-1v2h1v2.8h1.8v-2.8h1v-2h-1v-3h-1.8Z" /></svg>
        <div className="footer-payment-copy">
          <strong>SECURE PAYMENTS</strong>
          <span>Available payment options appear at checkout</span>
        </div>
        <div className="payment-methods-powered"><span>POWERED BY</span><b>stripe</b></div>
        <ul className="payment-method-logos" aria-label="Payment methods">
          <li className="payment-logo-visa">VISA</li>
          <li className="payment-logo-mastercard"><i aria-hidden="true" /><span>mastercard</span></li>
          <li className="payment-logo-paypal">PayPal</li>
          <li className="payment-logo-amex">AMERICAN<br />EXPRESS</li>
          <li className="payment-logo-discover">DISCOVER</li>
          <li className="payment-logo-apple">Apple Pay</li>
          <li className="payment-logo-google"><b>G</b> Pay</li>
          <li className="payment-logo-amazon">amazon pay</li>
        </ul>
      </section>
      <div className="store-footer-bottom">
        <span>© {new Date().getFullYear()} Des Collection LTD</span>
        <span>Style, Quality &amp; Elegance</span>
      </div>
    </footer>
  );
}
