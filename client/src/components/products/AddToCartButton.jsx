import { useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function AddToCartButton({ product, className = 'add-cart' }) {
  const { add, openCartDrawer } = useStore();
  const [phase, setPhase] = useState('idle');
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleAdd = () => {
    if (phase !== 'idle') return;
    setPhase('loading');
    timer.current = window.setTimeout(() => {
      add(product, { openDrawer: false });
      setPhase('added');
      timer.current = window.setTimeout(() => {
        setPhase('idle');
        openCartDrawer();
      }, 420);
    }, 320);
  };

  const label = phase === 'loading' ? `Adding ${product?.name || 'item'} to cart` : phase === 'added' ? `${product?.name || 'Item'} added to cart` : `Add ${product?.name || 'item'} to cart`;

  return (
    <button className={`${className} add-cart-feedback${phase === 'added' ? ' is-added' : ''}`} type="button" onClick={handleAdd} disabled={phase !== 'idle'} aria-label={label} aria-live="polite">
      {phase === 'loading' ? <><LoaderCircle className="button-spinner" size={19} /> ADDING TO CART</> : phase === 'added' ? <Check size={22} aria-label="Added to cart" /> : 'ADD TO CART'}
    </button>
  );
}
