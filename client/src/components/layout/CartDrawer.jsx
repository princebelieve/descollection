import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { imageOf, money } from '../../utils/products';

export default function CartDrawer() {
  const { cart, quantity, setCart, cartDrawerOpen, closeCartDrawer } = useStore();
  const subtotal = cart.reduce((sum, row) => sum + Number(row.product?.price || 0) * row.qty, 0);

  useEffect(() => {
    if (!cartDrawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeCartDrawer();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [cartDrawerOpen, closeCartDrawer]);

  if (!cartDrawerOpen) return null;

  return (
    <div className="cart-drawer-shade" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCartDrawer(); }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <header className="cart-drawer-header">
          <h2 id="cart-drawer-title">Shopping cart</h2>
          <button type="button" onClick={closeCartDrawer} aria-label="Close shopping cart"><X size={25} /><span>Close</span></button>
        </header>

        <div className="cart-drawer-items">
          {cart.length === 0 && <p className="cart-drawer-empty">Your cart is empty.</p>}
          {cart.map((row) => (
            <article className="cart-drawer-item" key={row.id}>
              <Link to={`/product/${row.id}`} onClick={closeCartDrawer} className="cart-drawer-image"><img src={imageOf(row.product)} alt={row.product?.name || ''} /></Link>
              <div className="cart-drawer-item-info">
                <div className="cart-drawer-item-heading">
                  <Link to={`/product/${row.id}`} onClick={closeCartDrawer}>{row.product?.name}</Link>
                  <button type="button" onClick={() => setCart((items) => items.filter((item) => String(item.id) !== String(row.id)))} aria-label={`Remove ${row.product?.name} from cart`}><X size={18} /></button>
                </div>
                <p className="cart-drawer-sku">SKU: {row.product?.sku || row.product?.SKU || 'N/A'}</p>
                <div className="cart-drawer-item-bottom">
                  <div className="cart-drawer-quantity" aria-label={`Quantity: ${row.qty}`}>
                    <button type="button" onClick={() => quantity(row.id, -1)} aria-label="Decrease quantity"><Minus size={15} /></button>
                    <span>{row.qty}</span>
                    <button type="button" onClick={() => quantity(row.id, 1)} aria-label="Increase quantity"><Plus size={15} /></button>
                  </div>
                  <strong>{Number(row.product?.price) > 0 ? money(row.product.price * row.qty) : 'Price TBC'}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer className="cart-drawer-footer">
          <div className="cart-drawer-subtotal"><span>Subtotal:</span><strong>{money(subtotal)}</strong></div>
          <Link className="cart-drawer-action" to="/cart" onClick={closeCartDrawer}>VIEW CART</Link>
          <Link className="cart-drawer-action" to="/checkout" onClick={closeCartDrawer}>CHECKOUT</Link>
        </footer>
      </aside>
    </div>
  );
}
