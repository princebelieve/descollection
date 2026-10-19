import { Link, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { imageOf, money } from '../utils/products';
import AddToCartButton from '../components/products/AddToCartButton';

export default function ProductDetail(){const {id}=useParams(),{products,toggleCompare,compare}=useStore();const p=products.find(x=>String(x._id||x.id)===id);if(!p)return <main className="page text-page"><h1>Product not found</h1><Link to="/shop">Return to shop</Link></main>;const selected=compare.some(x=>String(x.id)===String(p._id||p.id));return <main className="page product-detail"><img src={imageOf(p)} alt={p.name}/><div><p className="kicker">{p.category}</p><h1>{p.name}</h1><strong>{Number(p.price)>0?money(p.price):'Price TBC'}</strong><p>{p.description||'A Des-Collection favourite.'}</p><AddToCartButton product={p} /><button className="compare-detail" onClick={()=>toggleCompare({...p,id:p._id||p.id})}>{selected?'REMOVE FROM':'ADD TO'} COMPARE</button></div></main>}
