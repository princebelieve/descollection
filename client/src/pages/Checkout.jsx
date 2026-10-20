import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, LoaderCircle, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmbeddedStripeCheckout from '../components/checkout/EmbeddedStripeCheckout';
import { API } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { money } from '../utils/products';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export default function Checkout() {
  const { cart } = useStore();
  const [shippingZones, setShippingZones] = useState([]);
  const [shippingCountry, setShippingCountry] = useState('');
  const [customer, setCustomer] = useState({ name: '', email: '' });
  const [login, setLogin] = useState({ email: '', password: '' });
  const [clientSecret, setClientSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const subtotal = cart.reduce((sum, row) => sum + Number(row.product?.price || 0) * row.qty, 0);
  const missingPrice = cart.some((row) => !(Number(row.product?.price) > 0));
  const destinations = useMemo(() => shippingZones.flatMap((zone) => zone.countries.map((code) => ({ code, zone }))), [shippingZones]);
  const selectedDestination = destinations.find(({ code }) => code === shippingCountry);
  const delivery = Number(selectedDestination?.zone.fee || 0);

  useEffect(() => {
    fetch(`${API}/api/settings`).then((response) => response.ok ? response.json() : null).then((data) => {
      if (!data?.shippingZones?.length) return;
      setShippingZones(data.shippingZones);
      const countries = data.shippingZones.flatMap((zone) => zone.countries);
      setShippingCountry((current) => countries.includes(current) ? current : countries.includes('GB') ? 'GB' : countries[0] || '');
    }).catch(() => {});
  }, []);

  const handleEmbeddedError = useCallback((message) => setError(message), []);

  async function signIn(event) {
    event.preventDefault();
    setSigningIn(true);
    setLoginMessage('');
    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'We could not sign you in. Please try again.');
      localStorage.setItem('des-token', data.token);
      localStorage.setItem('des-role', data.role);
      setCustomer({ name: data.name || '', email: data.email || login.email });
      setLoginMessage(`Signed in as ${data.email || login.email}. Your email is ready for checkout.`);
      window.dispatchEvent(new Event('des-auth-changed'));
    } catch (signInError) {
      setLoginMessage(signInError.message);
    } finally {
      setSigningIn(false);
    }
  }

  async function startPayment() {
    if (missingPrice || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/payments/create-cart-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(({ id, qty }) => ({ id, qty })),
          customer,
          shippingCountry,
          uiMode: stripePublishableKey ? 'embedded' : 'hosted',
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error || 'Checkout is unavailable. Please try again.');
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
      } else if (result.url) {
        window.location.assign(result.url);
        return;
      } else {
        throw new Error('Secure checkout could not be started. Please try again.');
      }
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setBusy(false);
    }
  }

  if (!cart.length) return <main className="page checkout-page"><h1>Checkout</h1><p>Your cart is empty.</p><Link className="shop-now" to="/shop">RETURN TO SHOP</Link></main>;

  return (
    <main className="page checkout-page">
      <p className="kicker">SECURE CHECKOUT</p>
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <section className="checkout-main" aria-label="Checkout and payment">
          {!clientSecret && (
            <>
              <details className="checkout-disclosure checkout-signin">
                <summary>Returning customer? <strong>Sign in here</strong><ChevronDown size={19} /></summary>
                <form className="checkout-signin-form" onSubmit={signIn}>
                  <label>Email address<input type="email" autoComplete="email" required value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} /></label>
                  <label>Password<input type="password" autoComplete="current-password" required value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /></label>
                  <button className="checkout-signin-submit" disabled={signingIn}>{signingIn ? <><LoaderCircle className="button-spinner" size={17} /> SIGNING IN...</> : 'SIGN IN'}</button>
                  {loginMessage && <p className={loginMessage.startsWith('Signed in') ? 'checkout-inline-success' : 'checkout-inline-error'} role="status">{loginMessage}</p>}
                </form>
              </details>

              <details className="checkout-disclosure checkout-coupon">
                <summary>Have a coupon? <strong>Enter your code at payment</strong><ChevronDown size={19} /></summary>
                <p>Promo codes are entered and applied in the secure payment form below.</p>
              </details>

              {missingPrice && <p className="checkout-price-note">An item in your basket needs a price before online payment can continue. Please contact us or check back shortly.</p>}
              <label className="checkout-country">Delivery country<select required value={shippingCountry} onChange={(event) => setShippingCountry(event.target.value)}>
                <option value="" disabled>Select a delivery country</option>
                {destinations.map(({ code }) => <option key={code} value={code}>{new Intl.DisplayNames(['en'], { type: 'region' }).of(code)}</option>)}
              </select></label>
              {shippingZones.length === 0 && <p className="checkout-price-note">Shipping destinations are temporarily unavailable. Please try again later.</p>}
              {error && <p className="checkout-inline-error" role="alert">{error}</p>}
              <button className="shop-now checkout-start" type="button" onClick={startPayment} disabled={busy || missingPrice || !selectedDestination}>
                {busy ? <><LoaderCircle className="button-spinner" size={18} /> PREPARING SECURE CHECKOUT...</> : <><LockKeyhole size={17} /> CONTINUE TO PAYMENT</>}
              </button>
              <p className="checkout-secure-note">Secure payment by Stripe. Available payment methods are shown in the payment form.</p>
            </>
          )}
          {clientSecret && (
            <section className="checkout-embedded-section" aria-label="Secure payment form">
              <div className="checkout-embedded-heading"><div><p className="kicker">PAYMENT</p><h2>Choose how to pay</h2></div><LockKeyhole size={20} /></div>
              <p className="checkout-embedded-note">Card, wallet, and pay-later methods appear here when available for your order.</p>
              <EmbeddedStripeCheckout clientSecret={clientSecret} publishableKey={stripePublishableKey} onError={handleEmbeddedError} />
              {error && <div className="checkout-embed-error"><p className="checkout-inline-error" role="alert">{error}</p><button type="button" onClick={() => { setError(''); setClientSecret(''); }}>TRY AGAIN</button></div>}
            </section>
          )}
        </section>

        <aside className="checkout-summary">
          <h2>Your order</h2>
          {cart.map((row) => <div className="checkout-item" key={row.id}><span>{row.product?.name} × {row.qty}</span><b>{Number(row.product?.price) > 0 ? money(row.product.price * row.qty) : 'Price TBC'}</b></div>)}
          <div className="checkout-totals"><span>Subtotal</span><b>{money(subtotal)}</b><span>Delivery</span><b>{money(delivery)}</b><strong>Total</strong><strong>{money(subtotal + delivery)}</strong></div>
          <Link to="/cart">EDIT BASKET</Link>
        </aside>
      </div>
    </main>
  );
}
