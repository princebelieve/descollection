import { Link } from 'react-router-dom';

const policies = [
  ['/terms', 'Terms and conditions'],
  ['/privacy', 'Privacy notice'],
  ['/returns-refunds', 'Returns and refunds'],
  ['/shipping', 'Shipping policy'],
  ['/disclaimer', 'Disclaimer'],
];

export default function PolicyLinks() {
  return (
    <nav className="policy-links" aria-label="Store policies">
      <strong>Store policies</strong>
      {policies.map(([path, label]) => <Link key={path} to={path}>{label}</Link>)}
    </nav>
  );
}
