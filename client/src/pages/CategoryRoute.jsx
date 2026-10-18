import { useParams } from 'react-router-dom';
import Catalog from '../components/products/Catalog';

export default function CategoryRoute(){const {category}=useParams();return <Catalog category={decodeURIComponent(category)} title={decodeURIComponent(category)}/>}
