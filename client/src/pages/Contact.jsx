import { Mail, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const contactOptions = [
  { icon: Phone, label: 'Call us', value: '+44 7440 248472', href: 'tel:+447440248472' },
  { icon: Mail, label: 'Customer enquiries', value: 'sales@descollection.co.uk', href: 'mailto:sales@descollection.co.uk' },
  { icon: Mail, label: 'Contact the Des Collection LTD admin team', value: 'admin@descollection.co.uk', href: 'mailto:admin@descollection.co.uk' },
  { icon: MapPin, label: 'Visit us', value: '312 Moston Lane, Manchester M40 9WB', href: 'https://maps.google.com/?q=312+Moston+Lane,+Manchester+M40+9WB' },
];

export default function Contact() {
  return (
    <main className="contact-page">
      <section className="contact-card">
        <img className="contact-logo" src="/assets/des-collection-logo.png" alt="Des Collection LTD" />
        <p className="kicker">WE’RE HERE TO HELP</p>
        <h1>Contact Des Collection LTD</h1>
        <p className="contact-intro">Questions about a product, your order, or anything else? Choose the best way to reach us below.</p>
        <div className="contact-options">
          {contactOptions.map(({ icon: Icon, label, value, href }) => (
            <article className="contact-option" key={label}>
              <span className="contact-option-icon"><Icon size={21} aria-hidden="true" /></span>
              <div><h2>{label}</h2><a href={href}>{value}</a></div>
            </article>
          ))}
        </div>
        <div className="contact-actions">
          <a className="contact-button contact-button-primary" href="mailto:sales@descollection.co.uk"><Mail size={17} aria-hidden="true" /> Email us</a>
          <Link className="contact-button contact-button-secondary" to="/shop"><ShoppingBag size={17} aria-hidden="true" /> Browse the collection</Link>
        </div>
        <p className="contact-site">descollection.co.uk</p>
      </section>
    </main>
  );
}
