import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { API, categories, starter } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import ProductGrid from '../components/products/ProductGrid';
import { imageOf, money, productId } from '../utils/products';

const slides = [
  {
    image: '/assets/home-hero2.jpeg',
    eyebrow: 'YOUR STYLE, YOUR BEAUTY, YOUR COLLECTION',
    title: 'Beauty for Your Everyday',
    description: 'Explore beauty essentials selected to help you express your style and feel confident in your own way.',
    action: 'SHOP WITH DES-COLLECTION',
    category: 'Face Cream',
  },
  {
    image: '/assets/home-hero3.jpeg',
    eyebrow: 'CARE THAT FITS YOUR ROUTINE',
    title: 'Everyday Beauty Essentials',
    description: 'Find lotions, creams and oils to make your daily beauty routine feel like your own.',
    action: 'EXPLORE BODY CARE',
    category: 'Body Lotions',
  },
  {
    image: '/assets/home-hero4.png',
    eyebrow: 'CARE THAT CELEBRATES YOU',
    title: 'Feel Confident in Your Skin',
    description: 'Discover beauty and skincare favourites chosen to help you feel at home in your own style.',
    action: 'EXPLORE SKINCARE',
    category: 'Face Cream',
  },
  {
    image: '/assets/home-hero1.png',
    eyebrow: 'BEAUTY, STYLE AND MORE',
    title: 'Your Collection Starts Here',
    description: 'Shop cosmetics, fashion and lifestyle essentials chosen with your taste, comfort and confidence in mind.',
    action: 'SHOP THE COLLECTION',
    category: 'Face Cream',
  },
];

const promoPicks = [
  { match: 'Jhalak 24K Gold Collagen Body Lotion', eyebrow: 'NOURISH YOUR ROUTINE', fallback: 0 },
  { match: 'Effimax Q10 Papaya Facial Cream', eyebrow: 'A DAILY SKINCARE FAVOURITE', fallback: 1 },
];

const editorPicks = [
  'Effimax Q10 Concentrated Clarifying',
  'Jhalak Vitamin C Face Cream Set',
  'Parley Goldie Beauty Lotion',
  'Veet Gold Collagen Body Oil',
  'Golden Face Cream with Vitamin E',
];

function matchingProduct(products, name) {
  const needle = name.toLowerCase();
  return products.find((product) => product.name?.toLowerCase().includes(needle));
}

function SectionTitle({ eyebrow, title, to = '/shop', linkText = 'VIEW ALL PRODUCTS' }) {
  return (
    <div className="home-section-title">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <Link to={to}>{linkText}<ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  );
}

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const slide = slides[active];
  const showSlide = (index) => setActive((index + slides.length) % slides.length);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 9000);
    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <section className="home-hero" aria-label="Des-Collection featured products">
      <img key={slide.image} className={`home-hero-image${slide.image.endsWith('home-hero4.png') ? ' home-hero-image-4' : ''}`} src={slide.image} alt="" />
      <div className="home-hero-shade" />
      <div className="home-hero-copy" key={slide.title}>
        <span className="home-hero-brand">DES-COLLECTION</span>
        <p>{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <Link className="home-hero-cta" to={`/category/${encodeURIComponent(slide.category)}`}>
          {slide.action}<span><ArrowRight size={20} aria-hidden="true" /></span>
        </Link>
        <div className="home-hero-description">{slide.description}</div>
      </div>
      <a className="home-hero-scroll" href="#home-content"><ArrowDown size={22} aria-hidden="true" /><span>SCROLL DOWN</span></a>
      <div className="home-hero-controls" aria-label="Hero slide controls">
        <div className="home-hero-dots">
          {slides.map((item, index) => (
            <button key={item.title} className={index === active ? 'active' : ''} onClick={() => showSlide(index)} aria-label={`Show slide ${index + 1}: ${item.title}`} aria-current={index === active ? 'true' : undefined} />
          ))}
        </div>
        <button className="home-hero-arrow" onClick={() => showSlide(active - 1)} aria-label="Previous slide"><ArrowLeft size={20} /></button>
        <button className="home-hero-arrow next" onClick={() => showSlide(active + 1)} aria-label="Next slide"><ArrowRight size={20} /></button>
      </div>
    </section>
  );
}

function FeaturePromos({ products }) {
  const picks = promoPicks.map(({ match, fallback }) => matchingProduct(products, match) || products[fallback] || starter[fallback]).filter(Boolean);
  const uniquePicks = picks.filter((product, index) => picks.findIndex((candidate) => productId(candidate) === productId(product)) === index);

  return (
    <section className="home-promo-pair" aria-label="Featured products">
      {uniquePicks.map((product, index) => (
        <Link className={`home-product-promo promo-${index + 1}`} to={`/product/${productId(product)}`} key={productId(product)}>
          <img src={imageOf(product)} alt={product.name} />
          <span className="home-product-promo-copy">
            <small>{promoPicks[index]?.eyebrow || 'DES-COLLECTION FAVOURITE'}</small>
            <strong>{product.name}</strong>
            <span>{product.category || 'Beauty'}{Number(product.price) > 0 ? ` · ${money(product.price)}` : ''}</span>
            <b>SHOP NOW <ArrowRight size={16} aria-hidden="true" /></b>
          </span>
        </Link>
      ))}
    </section>
  );
}

function BestSellingCategories({ products }) {
  const productCounts = products.reduce((counts, product) => {
    const category = String(product.category || 'Beauty').trim();
    counts.set(category, (counts.get(category) || 0) + 1);
    return counts;
  }, new Map());
  const categoryCards = categories
    .filter((category) => category !== 'Brands')
    .map((category) => ({ name: category, count: productCounts.get(category) || 0 }))
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);

  return (
    <section className="home-categories-section">
      <SectionTitle eyebrow="EXPLORE WHAT SUITS YOUR STYLE" title="Shop by category" linkText="EXPLORE ALL CATEGORIES" to="/shop" />
      <div className="home-category-grid">
        {categoryCards.map(({ name, count }) => (
          <Link to={`/category/${encodeURIComponent(name)}`} key={name}>
            <span>{name}</span><small>{count} {count === 1 ? 'product' : 'products'}</small><ArrowRight size={17} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function BlemishFeature() {
  return (
    <section className="blemish-feature">
      <div className="blemish-copy">
        <span className="blemish-tag">BLEMISH CONTROL</span>
        <h2>Find beauty essentials for your routine.</h2>
        <p>Explore face care and cleansing products as part of a routine that works for you.</p>
        <Link className="blemish-button" to="/category/Cleanser">SHOP NOW <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <img src="/assets/blemish-control.png" alt="Skincare portrait for the blemish control collection" />
    </section>
  );
}

function EditorChoice({ products }) {
  const [tab, setTab] = useState('featured');
  const picks = editorPicks.map((name) => matchingProduct(products, name)).filter(Boolean);
  const discounted = products.filter((product) => Number(product.originalPrice) > Number(product.price));
  const items = tab === 'featured' ? picks.slice(0, 10) : discounted.slice(0, 10);

  return (
    <section className="home-editors">
      <div className="home-editors-heading">
        <span>THE DES-COLLECTION EDIT</span>
        <h2>Des-Collection Picks &amp; Offers</h2>
        <div className="home-editor-tabs" role="tablist" aria-label="Des-Collection picks and offers">
          <button role="tab" aria-selected={tab === 'featured'} className={tab === 'featured' ? 'active' : ''} onClick={() => setTab('featured')}>FEATURED PRODUCTS</button>
          <button role="tab" aria-selected={tab === 'discounted'} className={tab === 'discounted' ? 'active' : ''} onClick={() => setTab('discounted')}>DISCOUNTED PRODUCTS</button>
        </div>
      </div>
      {items.length ? <ProductGrid items={items} className="home-product-grid" /> : <p className="home-empty-state">There are no discounted products at the moment.</p>}
    </section>
  );
}

export default function Home() {
  const { products } = useStore();
  const [bestsellers, setBestsellers] = useState([]);
  const [salesDataLoaded, setSalesDataLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API}/api/products/bestsellers?days=7`)
      .then((response) => response.ok ? response.json() : { products: [] })
      .then((data) => { if (active) setBestsellers(Array.isArray(data.products) ? data.products : []); })
      .catch(() => { if (active) setBestsellers([]); })
      .finally(() => { if (active) setSalesDataLoaded(true); });
    return () => { active = false; };
  }, []);

  const newestProducts = useMemo(() => products.slice(0, 10), [products]);
  const bestsellersToShow = salesDataLoaded ? bestsellers : [];

  return (
    <main className="home-page">
      <HeroCarousel />
      <div className="home-page-content" id="home-content">
        <FeaturePromos products={products} />

        <section className="home-products-section">
          <SectionTitle eyebrow={bestsellersToShow.length ? 'MOST ORDERED IN THE LAST 7 DAYS' : 'FROM THE CURRENT COLLECTION'} title={bestsellersToShow.length ? 'Week Bestsellers' : 'Discover the collection'} />
          {bestsellersToShow.length
            ? <ProductGrid items={bestsellersToShow.slice(0, 10)} className="home-product-grid" />
            : <ProductGrid items={newestProducts.slice(0, 10)} className="home-product-grid" />}
        </section>

        <BestSellingCategories products={products} />
        <BlemishFeature />

        <section className="home-products-section home-new-arrivals">
          <SectionTitle eyebrow="JUST ADDED TO THE COLLECTION" title="New Arrivals" />
          <ProductGrid items={newestProducts.slice(0, 1)} className="home-product-grid" />
        </section>

        <EditorChoice products={products} />
      </div>
    </main>
  );
}
