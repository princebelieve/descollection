import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import StoreHeader from './components/layout/Header';
import Footer from './components/layout/Footer';
import { InstallAppProvider } from './components/layout/InstallApp';
import WhatsAppButton from './components/layout/WhatsAppButton';
import RecentSalesNotice from './components/layout/RecentSalesNotice';
import CartDrawer from './components/layout/CartDrawer';
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
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ReturnsRefunds from './pages/ReturnsRefunds';
import Shipping from './pages/Shipping';
import Disclaimer from './pages/Disclaimer';
import { setPageMetadata } from './utils/seo';
import { useStore } from './context/StoreContext';

function MaintenanceView() {
  const { siteSettings = {} } = useStore();
  return <main className="maintenance-page"><section className="maintenance-card">{siteSettings.banner && <img className="maintenance-banner" src={siteSettings.banner} alt="" />}<span className="maintenance-kicker">DES COLLECTION</span><h1>{siteSettings.title || 'We’ll be back soon'}</h1><p>{siteSettings.message || 'We’re making a few improvements. Please check back shortly.'}</p>{siteSettings.launchDate && <strong className="maintenance-launch">Expected return · {siteSettings.launchDate}</strong>}</section></main>;
}

function ShopRoute() {
  const params = new URLSearchParams(location.search);
  return <Catalog category="All" title="Shop" search={params.get('search') || ''} />;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

function GoogleAnalyticsPageViews() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: `${pathname}${search}${hash}`,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [pathname, search, hash]);

  return null;
}

function DefaultPageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (/^\/(product|blog)\/[^/]+$/.test(pathname)) return;
    const isHome = pathname === '/';
    const isBlog = pathname === '/blog';
    const policyPages = {
      '/terms': ['Terms and conditions | Des Collection LTD', 'Terms for shopping with Des Collection LTD.'],
      '/privacy': ['Privacy notice | Des Collection LTD', 'How Des Collection LTD handles personal information.'],
      '/returns-refunds': ['Returns and refunds | Des Collection LTD', 'How to request a return, replacement, or refund from Des Collection LTD.'],
      '/shipping': ['Shipping policy | Des Collection LTD', 'Order processing, delivery estimates, tracking, and shipping information.'],
      '/disclaimer': ['Disclaimer | Des Collection LTD', 'Product sourcing, brand references, and retailer information.'],
    };
    const policy = policyPages[pathname];
    setPageMetadata({
      title: isHome ? 'Des Collection LTD | Beauty, Skincare & Lifestyle' : isBlog ? 'Beauty Notes | Des Collection LTD' : policy?.[0] || 'Des Collection LTD',
      description: isBlog ? 'Thoughtful beauty care, everyday hygiene, and practical product guides from Des Collection LTD.' : policy?.[1] || 'Beauty, skincare and lifestyle essentials, selected with care.',
      image: '/assets/des-collection-logo.png',
      path: pathname,
    });
  }, [pathname]);
  return null;
}

function PublicSite() {
  const { pathname } = useLocation();
  const { siteSettings = {} } = useStore();
  const isAdmin = pathname.startsWith('/admin');
  const isPaymentResult = ['/checkout/success', '/checkout/cancelled'].includes(pathname);
  if (siteSettings.maintenance && !isAdmin && !isPaymentResult) return <MaintenanceView />;
  if (!isAdmin && ((siteSettings.blockCheckout && pathname === '/checkout') || (siteSettings.blockSignIn && ['/account', '/sign-in'].includes(pathname)) || (siteSettings.blockSignUp && pathname === '/sign-up'))) return <MaintenanceView />;
  return <><StoreHeader /><CartDrawer /><Routes>
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
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/returns-refunds" element={<ReturnsRefunds />} />
    <Route path="/shipping" element={<Shipping />} />
    <Route path="/disclaimer" element={<Disclaimer />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/compare" element={<Compare />} />
    <Route path="/account" element={<Account />} />
    <Route path="/sign-in" element={<Account />} />
    <Route path="/sign-up" element={<Account />} />
    <Route path="/admin/*" element={<Admin />} />
    <Route path="/checkout/success" element={<CheckoutResult success />} />
    <Route path="/checkout/cancelled" element={<CheckoutResult success={false} />} />
    <Route path="*" element={<Home />} />
  </Routes><Footer /><WhatsAppButton /><RecentSalesNotice /></>;
}

export default function App() {
  return <InstallAppProvider><StoreProvider><ScrollToTop /><DefaultPageMetadata /><GoogleAnalyticsPageViews /><PublicSite /></StoreProvider></InstallAppProvider>;
}
