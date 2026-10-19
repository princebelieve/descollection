import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { imageOf, money, productId } from '../../utils/products';
import AddToCartButton from './AddToCartButton';

export default function ProductCard({ product }) {
  const { wishlist, toggleWish } = useStore();
  const id = productId(product);
  const saved = wishlist.some((item) => String(item.id) === id);
  const originalPrice = Number(product.originalPrice);
  const isDiscounted = originalPrice > Number(product.price);
  const discount = isDiscounted ? Math.round((1 - Number(product.price) / originalPrice) * 100) : 0;

  return (
    <article className="product-card">
      {isDiscounted && <span className="discount-badge">-{discount}%</span>}
      <Link className="product-photo" to={`/product/${id}`}><img src={imageOf(product)} alt={product.name} /></Link>
      <button className={`heart ${saved ? 'saved' : ''}`} onClick={() => toggleWish(product)} aria-label="Wishlist">
        {saved ? '♥' : '♡'}
      </button>
      <div className="product-info">
        <Link to={`/product/${id}`} className="product-name">{product.name}</Link>
        <Link className="product-cat" to={`/category/${encodeURIComponent(product.category || 'Beauty')}`}>{product.category || 'Beauty'}</Link>
        <strong className="product-price">
          {isDiscounted && <del>{money(originalPrice)}</del>}{Number(product.price) > 0 ? money(product.price) : 'Price TBC'}
        </strong>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
