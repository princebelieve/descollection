import { useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductGrid from '../components/products/ProductGrid';

export default function BrandDetail(){const {brand}=useParams(),{products}=useStore(),name=decodeURIComponent(brand);const items=products.filter(p=>p.name.toLowerCase().includes(name.toLowerCase()));return <main className="page catalog-page"><div className="catalog-banner"><h1>{name}</h1></div><div className="catalog-tools">BRAND COLLECTION</div><ProductGrid items={items}/></main>}
