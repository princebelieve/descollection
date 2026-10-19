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

    const showNext = () => {
      if (!mounted) return;
      setNotice({
        shopper: randomItem(shoppers),
        product: randomItem(products),
        hoursAgo: Math.floor(Math.random() * 4) + 1,
      });
      hideTimer = window.setTimeout(() => setNotice(null), 6500);
      nextTimer = window.setTimeout(showNext, 14000 + Math.floor(Math.random() * 14000));
    };

    const initialTimer = window.setTimeout(showNext, 5000);
    return () => {
      mounted = false;
      window.clearTimeout(initialTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(nextTimer);
    };
  }, [products]);

  if (!notice) return null;

  return (
    <aside className="recent-sales-notice" aria-live="polite">
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
