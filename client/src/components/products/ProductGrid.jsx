import ProductCard from './ProductCard';

export default function ProductGrid({items}){return items.length?<div className="products-grid">{items.map(p=><ProductCard key={p._id||p.id} product={p}/>)}</div>:<p className="empty">No products found in this category yet.</p>}
