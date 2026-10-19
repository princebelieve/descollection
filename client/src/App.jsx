import { Route, Routes } from 'react-router-dom';
import StoreHeader from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';
import RecentSalesNotice from './components/layout/RecentSalesNotice';
import Catalog from './components/products/Catalog';
import { StoreProvider } from './context/StoreContext';
import Account from './pages/Account';
import About from './pages/About';
import Admin from './pages/Admin';
import Blog from './pages/Blog';
import BrandDetail from './pages/BrandDetail';
import Brands from './pages/Brands';
import Cart from './pages/Cart';
import CategoryRoute from './pages/CategoryRoute';
import CheckoutResult from './pages/CheckoutResult';
import Compare from './pages/Compare';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';

function ShopRoute() {
  const params = new URLSearchParams(location.search);
  return <Catalog category="All" title="Shop" search={params.get('search') || ''} />;
}

export default function App() {
  return <StoreProvider><StoreHeader /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/shop" element={<ShopRoute />} />
    <Route path="/category/:category" element={<CategoryRoute />} />
    <Route path="/brands" element={<Brands />} />
    <Route path="/brands/:brand" element={<BrandDetail />} />
    <Route path="/about" element={<About />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/:id" element={<Blog />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/compare" element={<Compare />} />
    <Route path="/account" element={<Account />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/checkout/success" element={<CheckoutResult success />} />
    <Route path="/checkout/cancelled" element={<CheckoutResult success={false} />} />
    <Route path="*" element={<Home />} />
  </Routes><Footer /><WhatsAppButton /><RecentSalesNotice /></StoreProvider>;
}
