import { ArrowRight, Heart, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const collections = [
  ['Facial skincare', 'Face Cream'],
  ['Body care', 'Body Lotions'],
  ['Serums and treatments', 'Serum'],
  ['Hair care', 'Hair Care'],
  ['Makeup and beauty accessories', 'Cosmetics'],
  ['Shoes, bags and accessories', 'All'],
  ['Fragrance', 'Fragrances'],
  ['Sets and everyday essentials', 'Set'],
];

const values = [
  { icon: Heart, title: 'Beauty is personal', text: 'Every person has their own style, routine and preferences. We make room for the choices that feel right to you.' },
  { icon: Sparkles, title: 'A collection with choice', text: 'Explore beauty, skincare, haircare, fashion and lifestyle essentials in one convenient place.' },
  { icon: Star, title: 'Shop with confidence', text: 'Find products for your routine and discover new favourites at your own pace.' },
];

export default function About() {
  return (
    <main className="about-page">
      <section className="about-intro">
        <p className="kicker">ABOUT DES-COLLECTION</p>
        <h1>Beauty, Confidence <span>&amp; Choice</span></h1>
        <p className="about-intro-lead">Your Style, Your Beauty, Your Collection.</p>
        <p className="about-intro-copy">Des-Collection is a UK-based online destination for beauty, fashion and lifestyle essentials, bringing together a considered mix of products for the way you choose to look and feel.</p>
      </section>

      <section className="about-collection">
        <div className="about-image-wrap">
          <img src="/assets/about-image.png" alt="A woman enjoying her skincare routine" />
          <span>DES-COLLECTION · YOUR STYLE, YOUR CHOICE</span>
        </div>
        <div className="about-collection-copy">
          <p className="kicker">EXPLORE DES-COLLECTION</p>
          <h2>A collection for your everyday</h2>
          <p>From refreshing your beauty routine to finding a finishing touch for your look, explore a growing range chosen to suit different tastes, needs and moments.</p>
          <ul>
            {collections.map(([label, category]) => (
              <li key={label}><Link to={category === 'All' ? '/shop' : `/category/${encodeURIComponent(category)}`}>{label}<ArrowRight size={16} aria-hidden="true" /></Link></li>
            ))}
          </ul>
          <Link className="about-shop-link" to="/shop">EXPLORE THE COLLECTION <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="about-belief">
        <p className="kicker">WHAT MATTERS TO US</p>
        <h2>Beauty is personal.</h2>
        <p>Different people have different skin types, routines and preferences. Our aim is to offer a broad selection, so you can make informed choices and shape a collection that feels like yours.</p>
      </section>

      <section className="about-values" aria-label="The Des-Collection experience">
        {values.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={25} strokeWidth={1.6} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="about-cta">
        <div><p className="kicker">YOUR STYLE. YOUR BEAUTY. YOUR CHOICE.</p><h2>Find what feels like you.</h2></div>
        <Link to="/shop">SHOP DES-COLLECTION <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
