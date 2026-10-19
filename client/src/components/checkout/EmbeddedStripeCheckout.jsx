import { useEffect, useRef, useState } from 'react';

let stripeScriptPromise;

function loadStripeScript() {
  if (window.Stripe) return Promise.resolve(window.Stripe);
  if (!stripeScriptPromise) {
    stripeScriptPromise = new Promise((resolve, reject) => {
      let script = document.querySelector('script[data-stripe-js]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.dataset.stripeJs = 'true';
      }
      const handleLoad = () => window.Stripe ? resolve(window.Stripe) : reject(new Error('Stripe could not be loaded.'));
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', () => reject(new Error('Secure checkout could not be loaded. Please try again.')), { once: true });
      if (!script.isConnected) document.head.appendChild(script);
      else if (script.readyState === 'complete' || script.readyState === 'loaded') handleLoad();
    }).catch((error) => {
      stripeScriptPromise = null;
      throw error;
    });
  }
  return stripeScriptPromise;
}

export default function EmbeddedStripeCheckout({ clientSecret, publishableKey, onError }) {
  const mountPoint = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let checkout;
    setLoading(true);

    loadStripeScript()
      .then((Stripe) => Stripe(publishableKey).initEmbeddedCheckout({ clientSecret }))
      .then((instance) => {
        checkout = instance;
        if (!active) {
          checkout.destroy();
          return;
        }
        checkout.mount(mountPoint.current);
        setLoading(false);
      })
      .catch((error) => {
        if (active) {
          onError(error.message || 'Secure checkout could not be loaded. Please try again.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
      checkout?.destroy();
    };
  }, [clientSecret, publishableKey, onError]);

  return (
    <div className="embedded-checkout-frame">
      {loading && <div className="embedded-checkout-loading" role="status">Loading secure payment options…</div>}
      <div ref={mountPoint} />
    </div>
  );
}
