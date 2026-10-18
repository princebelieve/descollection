import { useStore } from '../context/StoreContext';
import { imageOf, money } from '../utils/products';

export default function Compare(){const {compare,toggleCompare}=useStore();return <main className="page text-page"><p className="kicker">PRODUCT COMPARISON</p><h1>Compare products</h1>{compare.length?<div className="compare-grid">{compare.map(p=><article key={p.id}><img src={imageOf(p)} alt=""/><h2>{p.name}</h2><p>{p.category}</p><b>{Number(p.price)>0?money(p.price):'Price TBC'}</b><button onClick={()=>toggleCompare(p)}>Remove</button></article>)}</div>:<p>Your comparison list is empty. Open a product to add it here.</p>}</main>}
