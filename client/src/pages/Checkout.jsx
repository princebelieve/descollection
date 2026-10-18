import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { money } from '../utils/products';

const emptyCustomer = { name: '', email: '', phone: '', address: '', city: '', postcode: '' };

export default function Checkout() {
  const { cart, delivery, notify } = useStore();
  const [customer, setCustomer] = useState(emptyCustomer);
  const [busy, setBusy] = useState(false);
  const subtotal = cart.reduce((sum, row) => sum + Number(row.product?.price || 0) * row.qty, 0);
  const missingPrice = cart.some((row) => !(Number(row.product?.price) > 0));

  async function submit(event) {
    event.preventDefault();
    if (missingPrice) return;
    setBusy(true);
    try {
      const response = await fetch(`${API}/api/payments/create-cart-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(({ id, qty }) => ({ id, qty })), customer }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error || 'Checkout is unavailable');
      window.location.assign(result.url);
    } catch (error) {
      notify(error.message);
      setBusy(false);
    }
  }

  if (!cart.length) return <main className="page checkout-page"><h1>Checkout</h1><p>Your cart is empty.</p><Link className="shop-now" to="/shop">RETURN TO SHOP</Link></main>;

  return <main className="page checkout-page">
    <p className="kicker">SECURE CHECKOUT</p>
    <h1>Delivery details</h1>
    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={submit}>
        <label>Full name<input autoComplete="name" required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} /></label>
        <label>Email address<input type="email" autoComplete="email" required value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} /></label>
        <label>Phone number<input type="tel" autoComplete="tel" required value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} /></label>
        <label>Address<input autoComplete="street-address" required value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} /></label>
        <div className="checkout-address-row">
          <label>Town or city<input autoComplete="address-level2" required value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} /></label>
          <label>Postcode<input autoComplete="postal-code" required value={customer.postcode} onChange={(event) => setCustomer({ ...customer, postcode: event.target.value })} /></label>
        </div>
        {missingPrice && <p className="checkout-price-note">An item in your basket needs a price before online payment can continue. Please contact us or check back shortly.</p>}
        <button className="shop-now" disabled={busy || missingPrice}>{busy ? 'CONNECTING TO PAYMENT...' : 'CONTINUE TO PAYMENT'}</button>
      </form>
      <aside className="checkout-summary">
        <h2>Your order</h2>
        {cart.map((row) => <div className="checkout-item" key={row.id}><span>{row.product?.name} × {row.qty}</span><b>{Number(row.product?.price) > 0 ? money(row.product.price * row.qty) : 'Price TBC'}</b></div>)}
        <div className="checkout-totals"><span>Subtotal</span><b>{money(subtotal)}</b><span>Delivery</span><b>{money(delivery)}</b><strong>Total</strong><strong>{money(subtotal + delivery)}</strong></div>
        <Link to="/cart">EDIT BASKET</Link>
      </aside>
    </div>
  </main>;
}
