import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { imageOf, money, productId } from '../utils/products';
import { setPageMetadata } from '../utils/seo';
import AddToCartButton from '../components/products/AddToCartButton';
import ShareLinks from '../components/ShareLinks';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, toggleCompare, compare } = useStore();
  const product = products.find((item) => productId(item) === id);
  const image = product ? imageOf(product) : '';

  useEffect(() => {
    if (!product) return;
    const description = product.description || `${product.name} from Des-Collection. Explore product details, price, and availability.`;
    setPageMetadata({
      title: `${product.name} | Des-Collection`,
      description: description.slice(0, 300),
      image,
      path: `/product/${id}`,
      type: 'product',
    });
  }, [id, image, product]);

  if (!product) return <main className="page text-page"><h1>Product not found</h1><Link to="/shop">Return to shop</Link></main>;

  const selected = compare.some((item) => productId(item) === id);
  return <main className="page product-detail">
    <div className="product-detail-image"><img src={image} alt={product.name} /></div>
    <div>
      <p className="kicker">{product.category}</p>
      <h1>{product.name}</h1>
      <strong>{Number(product.price) > 0 ? money(product.price) : 'Price TBC'}</strong>
      <p>{product.description || 'A Des-Collection favourite.'}</p>
      <AddToCartButton product={product} />
      <button className="compare-detail" onClick={() => toggleCompare({ ...product, id })}>{selected ? 'REMOVE FROM' : 'ADD TO'} COMPARE</button>
      <ShareLinks path={`/product/${id}`} title={product.name} />
    </div>
  </main>;
}
