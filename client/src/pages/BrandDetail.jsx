import { useParams } from 'react-router-dom';
import Catalog from '../components/products/Catalog';

export default function BrandDetail() {
  const { brand } = useParams();
  const name = brand;
  return <Catalog title={name} brand={name} />;
}
