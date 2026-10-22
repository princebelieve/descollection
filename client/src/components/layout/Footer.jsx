import { Link } from 'react-router-dom';

const footerGroups = [
  { title: 'Skincare', items: ['Cleanser', 'Creams', 'Face Cream', 'Face Wash', 'Serum', 'Toner'] },
  { title: 'Body & Hair', items: ['Body Lotions', 'Body Wash', 'Hair Care', 'Oil', 'Scrub', 'Soap'] },
  { title: 'Makeup & Fragrance', items: ['Cosmetics', 'Fragrances', 'Set'] },
  { title: 'Jewellery & More', items: ['Bags', 'Earrings', 'Shoes'] },
];

export default function Footer() {
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
      <div className="store-footer-bottom">
        <span>© {new Date().getFullYear()} Des Collection LTD</span>
        <span>Style, Quality &amp; Elegance</span>
      </div>
    </footer>
  );
}
