import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, LoaderCircle, ShieldCheck } from 'lucide-react';
import { API } from '../data/catalog';
import { money } from '../utils/products';
import { useStore } from '../context/StoreContext';

export default function CheckoutResult({ success }) {
  const { setCart } = useStore();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [result, setResult] = useState(() => success ? 'checking' : 'cancelled');
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!success) {
      setResult('cancelled');
      return undefined;
    }
    if (!sessionId) {
      setResult('unverified');
      return undefined;
    }
    let active = true;
    fetch(`${API}/api/payments/session-status/${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'We could not verify this payment.');
        return data;
      })
      .then((data) => {
        if (!active) return;
        setDetails(data);
        setResult(data.status);
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message);
        setResult('unverified');
      });
    return () => { active = false; };
  }, [success, sessionId]);

  useEffect(() => {
    if (result === 'paid') {
      setCart([]);
      localStorage.removeItem('des-cart');
    }
  }, [result, setCart]);

  const paid = result === 'paid';
  const failed = result === 'failed' || result === 'cancelled';
  const address = details?.shippingAddress;
  const addressText = address ? [address.line1, address.line2, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ') : '';
  const orderMessage = details ? [
    'Hello Des Collection LTD, I have completed payment for this order.',
    `Order reference: ${details.sessionId}`,
    `Customer: ${details.customerName || 'Not provided'}`,
    `Email: ${details.customerEmail || 'Not provided'}`,
    `Phone: ${details.customerPhone || 'Not provided'}`,
    'Items:',
    ...(details.items || []).map((item) => `• ${item.name} × ${item.quantity}${item.amount != null ? ` — ${money(item.amount)}` : ''}`),
    `Total paid: ${money((details.amountTotal || 0) / 100)}`,
    `Delivery address: ${addressText || 'Not provided by Stripe'}`,
  ].join('\n') : '';
  const whatsappOrderUrl = `https://wa.me/447440248472?text=${encodeURIComponent(orderMessage)}`;
  const heading = paid
    ? 'Your order is confirmed'
    : failed
      ? 'Payment wasn’t completed'
      : result === 'checking'
        ? 'Confirming your payment'
        : result === 'pending'
          ? 'Your payment is processing'
          : result === 'open'
            ? 'Your checkout is still open'
            : 'We couldn’t confirm your payment';
  const description = paid
    ? 'Thank you for shopping with Des Collection LTD. Stripe has confirmed your payment and we’ll prepare your order.'
    : failed
      ? 'No successful payment was recorded. Your basket is saved, so you can review it and try again.'
      : result === 'checking'
        ? 'We’re checking the payment status securely with Stripe. This usually takes just a moment.'
        : result === 'pending'
          ? 'Stripe has not marked this payment as complete yet. We’ll update your order once the payment is confirmed.'
          : result === 'open'
            ? 'This checkout session has not been completed. Return to your basket to try again.'
            : 'The payment provider did not return a confirmed result. Your basket is still available; please check your Stripe receipt or contact us before trying again.';

  return (
    <main className={`page payment-result payment-result-${paid ? 'paid' : failed ? 'failed' : 'waiting'}`}>
      <section className="payment-result-card" aria-live="polite">
        <div className="payment-result-brand"><span className="payment-result-monogram">D</span><span>DES COLLECTION LTD</span></div>
        <div className={`payment-result-icon ${paid ? 'is-paid' : failed ? 'is-failed' : ''}`}>
          {paid ? <Check size={31} strokeWidth={2.3} /> : failed ? <AlertCircle size={29} /> : result === 'checking' ? <LoaderCircle className="button-spinner" size={29} /> : <ShieldCheck size={29} />}
        </div>
        <p className="kicker">{paid ? 'PAYMENT CONFIRMED' : failed ? 'PAYMENT NOT COMPLETED' : result === 'checking' ? 'SECURE PAYMENT CHECK' : 'PAYMENT UPDATE'}</p>
        <h1>{heading}</h1>
        <p className="payment-result-description">{description}</p>

        {paid && details && (
          <div className="payment-result-receipt">
            <div><span>Order reference</span><strong>{details.sessionId?.slice(-10).toUpperCase()}</strong></div>
            {details.amountTotal != null && <div><span>Paid</span><strong>{money(details.amountTotal / 100)}</strong></div>}
            {details.customerEmail && <div><span>Confirmation sent to</span><strong>{details.customerEmail}</strong></div>}
            {addressText && <div><span>Delivering to</span><strong>{addressText}</strong></div>}
          </div>
        )}
        {message && <p className="payment-result-message" role="status">{message}</p>}
        {result === 'pending' && details?.customerEmail && <p className="payment-result-footnote">We’ll send an update to {details.customerEmail} when the payment status changes.</p>}

        <div className="payment-result-actions">
          {paid ? <Link className="shop-now" to="/shop">CONTINUE SHOPPING <ArrowRight size={17} /></Link>
            : failed || result === 'open' ? <Link className="shop-now" to="/checkout">RETURN TO CHECKOUT <ArrowRight size={17} /></Link>
              : <Link className="payment-result-secondary" to="/">RETURN TO HOME</Link>}
          {paid && <Link className="payment-result-secondary" to="/">BACK TO HOME</Link>}
          {failed && <Link className="payment-result-secondary" to="/shop">CONTINUE BROWSING</Link>}
        </div>
        {paid && <a className="payment-result-whatsapp" href={whatsappOrderUrl} target="_blank" rel="noreferrer">SEND ORDER DETAILS TO WHATSAPP</a>}
        <p className="payment-result-secure"><ShieldCheck size={15} /> Payment status verified securely with Stripe</p>
      </section>
    </main>
  );
}
