import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { imageOf } from '../../utils/products';

const shoppers = [
  { name: 'Jenny', city: 'Manchester' },
  { name: 'Aisha', city: 'Nottingham' },
  { name: 'Tia', city: 'Aldershot' },
  { name: 'Amara', city: 'Birmingham' },
  { name: 'Chloe', city: 'Leeds' },
  { name: 'Grace', city: 'London' },
  { name: 'Zara', city: 'Bristol' },
  { name: 'Mariam', city: 'Sheffield' },
];

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

export default function RecentSalesNotice() {
  const { products } = useStore();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!products.length) return undefined;

    let hideTimer;
    let nextTimer;
    let mounted = true;
    let lastUserActivity = Date.now();
    const noteUserActivity = () => { lastUserActivity = Date.now(); };
    window.addEventListener('pointerdown', noteUserActivity, { passive: true });
    window.addEventListener('keydown', noteUserActivity);

    const showNext = () => {
      if (!mounted) return;
      const activeElement = document.activeElement;
      const userIsEnteringData = activeElement?.matches('input, textarea, select, [contenteditable="true"]');
      const userWasRecentlyActive = Date.now() - lastUserActivity < 15000;
      if (document.hidden || userIsEnteringData || userWasRecentlyActive) {
        nextTimer = window.setTimeout(showNext, 15000);
        return;
      }

      setNotice({
        id: Date.now(),
        shopper: randomItem(shoppers),
        product: randomItem(products),
        hoursAgo: Math.floor(Math.random() * 4) + 1,
      });
      hideTimer = window.setTimeout(() => setNotice(null), 6500);
      nextTimer = window.setTimeout(showNext, 42000 + Math.floor(Math.random() * 42000));
    };

    const initialTimer = window.setTimeout(showNext, 15000);
    return () => {
      mounted = false;
      window.clearTimeout(initialTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(nextTimer);
      window.removeEventListener('pointerdown', noteUserActivity);
      window.removeEventListener('keydown', noteUserActivity);
    };
  }, [products]);

  if (!notice) return null;

  return (
    <aside key={notice.id} className="recent-sales-notice" aria-live="polite">
      <img src={imageOf(notice.product)} alt="" />
      <p>
        <strong>{notice.shopper.name} - from {notice.shopper.city}</strong>
        <span><em>purchased</em> {notice.product.name}</span>
        <small>{notice.hoursAgo} {notice.hoursAgo === 1 ? 'hour' : 'hours'} ago</small>
      </p>
      <button type="button" onClick={() => setNotice(null)} aria-label="Close purchase notification">×</button>
    </aside>
  );
}
