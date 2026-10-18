import { Link } from 'react-router-dom';
import { categories } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import ProductGrid from '../components/products/ProductGrid';

export default function Home(){const {products}=useStore();return <main className="page home-page"><section className="home-brand"><p>WELCOME TO DES-COLLECTION</p><h1>Your Style, Your Beauty,<br/>Your Collection!</h1><span>Beauty, skincare and lifestyle essentials chosen with care.</span><Link className="shop-now" to="/shop">SHOP THE COLLECTION</Link></section><section className="home-section"><div className="section-title"><div><small>DISCOVER THE COLLECTION</small><h2>Shop favourites</h2></div><Link to="/shop">View all →</Link></div><ProductGrid items={products.slice(0,8)}/></section><div className="home-cats">{categories.slice(1,9).map(c=><Link key={c} to={`/category/${encodeURIComponent(c)}`}>{c}<span>→</span></Link>)}</div><section className="about-short"><h2>Welcome to Des-Collection</h2><p>We bring together beauty, fashion and lifestyle essentials to help you express your style and feel your best.</p><Link to="/about">Read our story →</Link></section></main>}
