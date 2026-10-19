import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import ProductGrid from './ProductGrid';

export default function Catalog({ category = 'All', title = 'Shop', search = '', brand = '' }) {
  const { products } = useStore();
  const [sort, setSort] = useState('featured');
  const [query, setQuery] = useState(search);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const items = useMemo(() => {
    const filtered = products.filter((product) => {
      const productCategory = String(product.category || '').toLowerCase();
      const productName = String(product.name || '');
      const matchesCategory = category === 'All' || productCategory === category.toLowerCase();
      const matchesBrand = !brand || productName.toLowerCase().includes(brand.toLowerCase());
      const matchesQuery = !query || productName.toLowerCase().includes(query.toLowerCase());
      const price = Number(product.price) || 0;
      const matchesMin = minPrice === '' || price >= Number(minPrice);
      const matchesMax = maxPrice === '' || price <= Number(maxPrice);
      return matchesCategory && matchesBrand && matchesQuery && matchesMin && matchesMax;
    });

    if (sort === 'low') filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    if (sort === 'high') filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [products, category, brand, query, minPrice, maxPrice, sort]);

  const availableCategories = [...new Set(products.map((product) => product.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  return (
    <main className="page catalog-page">
      <div className="catalog-banner"><h1>{title}</h1></div>

      <form className="catalog-search" onSubmit={(event) => event.preventDefault()} role="search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder={`Search ${brand ? `${title} products` : category === 'All' ? 'all products' : `${title} products`}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Filter products by name"
        />
        {query && <button type="button" onClick={() => setQuery('')}>CLEAR</button>}
      </form>

      <div className="catalog-layout">
        <aside className="catalog-sidebar" aria-label="Product filters">
          <h2>Filter by</h2>
          <details className="catalog-filter" open>
            <summary>Categories</summary>
            <nav>
              <Link className={category === 'All' ? 'selected' : ''} to="/shop">All products</Link>
              {availableCategories.map((item) => (
                <Link className={category.toLowerCase() === item.toLowerCase() ? 'selected' : ''} key={item} to={`/category/${encodeURIComponent(item)}`}>{item}</Link>
              ))}
            </nav>
          </details>
          <details className="catalog-filter" open>
            <summary>Price</summary>
            <div className="catalog-price-fields">
              <label>Min (£)<input type="number" min="0" step="0.01" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} /></label>
              <label>Max (£)<input type="number" min="0" step="0.01" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></label>
            </div>
          </details>
        </aside>

        <section className="catalog-results" aria-label={`${title} products`}>
          <div className="catalog-toolbar">
            <p><strong>{items.length}</strong> products</p>
            <label>Sort by
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
          <ProductGrid items={items} />
        </section>
      </div>
    </main>
  );
}
