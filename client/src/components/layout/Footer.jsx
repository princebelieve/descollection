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
      <section className="payment-methods-strip footer-payment-methods" aria-label="Secure payment options available at checkout">
        <span className="payment-methods-heading">SECURE PAYMENTS</span>
        <span className="payment-method-mark payment-visa">VISA</span>
        <span className="payment-method-mark payment-mastercard"><i aria-hidden="true" /><b>mastercard</b></span>
        <span className="payment-method-mark payment-amex">AMERICAN<br />EXPRESS</span>
        <span className="payment-method-mark payment-apple">Apple Pay</span>
        <span className="payment-method-mark payment-google"><b>G</b> Pay</span>
        <span className="payment-method-mark payment-link">Link</span>
        <span className="payment-methods-powered">Powered by Stripe</span>
        <span className="payment-methods-more">More options may appear at checkout</span>
      </section>
      <div className="store-footer-bottom">
        <span>© {new Date().getFullYear()} Des Collection LTD</span>
        <span>Style, Quality &amp; Elegance</span>
      </div>
    </footer>
  );
}
