import { useStore } from '../context/StoreContext';
import ProductGrid from '../components/products/ProductGrid';

export default function Wishlist(){const {wishlist}=useStore();return <main className="page"><p className="kicker">YOUR SAVED FINDS</p><h1>Wishlist</h1><ProductGrid items={wishlist}/></main>}
