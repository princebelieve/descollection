import { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { API, categories } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { imageOf, money } from '../utils/products';

const emptyProduct = { name: '', category: '', price: '', originalPrice: '', description: '' };
const specifyCategory = '__specify_category__';
const loadSavedCategories = () => {
  try { return JSON.parse(localStorage.getItem('des-categories') || '[]').filter((category) => typeof category === 'string'); }
  catch { return []; }
};
const emptyPost = { title: '', excerpt: '', content: '', published: false };
const otherCountry = '__other_country__';
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const nonCountryRegions = new Set(['EU', 'EZ', 'UN', 'QO', 'XA', 'XB']);
const countryOptions = Array.from({ length: 26 * 26 }, (_, index) => String.fromCharCode(65 + Math.floor(index / 26), 65 + index % 26))
  .map((code) => ({ code, name: regionNames.of(code) }))
  .filter(({ code, name }) => name && name !== code && name !== 'Unknown Region' && !nonCountryRegions.has(code))
  .sort((a, b) => a.name.localeCompare(b.name));
const scrollToPageTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
const scrollToAdminForm = (formRef) => requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

export default function Admin() {
  const { products, setProducts, delivery, setDelivery, notify } = useStore();
  const [token, setToken] = useState(localStorage.getItem('des-role') === 'admin' ? localStorage.getItem('des-token') || '' : '');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [form, setForm] = useState(emptyProduct);
  const [specifyingCategory, setSpecifyingCategory] = useState(false);
  const [savedCategories, setSavedCategories] = useState(loadSavedCategories);
  const [file, setFile] = useState(null);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState(emptyPost);
  const [postFile, setPostFile] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [shippingZones, setShippingZones] = useState([{ name: 'United Kingdom', countries: ['GB'], fee: delivery }]);
  const [countrySelection, setCountrySelection] = useState('');
  const [otherCountryName, setOtherCountryName] = useState('');
  const specifiedCountry = countryOptions.find(({ name }) => name.toLowerCase() === otherCountryName.trim().toLowerCase());
  const productFormRef = useRef(null);
  const postFormRef = useRef(null);
  const auth = { Authorization: `Bearer ${token}` };
  const productCategories = [...new Map([...categories.filter((category) => category !== 'Brands' && category !== 'More'), ...savedCategories, ...products.map((product) => product.category)].filter(Boolean).map((category) => [category.trim().toLowerCase(), category.trim()])).values()].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/settings`).then((response) => response.ok ? response.json() : null).then((data) => {
      if (data?.shippingZones?.length) setShippingZones(data.shippingZones);
    }).catch(() => {});
    fetch(`${API}/api/blog/admin`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load blog posts');
        setPosts(data);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const loginAdmin = async (event) => {
    event.preventDefault();
    setBusyAction('login');
    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      if (data.role !== 'admin') throw new Error('This account does not have admin access');
      localStorage.setItem('des-token', data.token);
      localStorage.setItem('des-role', data.role);
      window.dispatchEvent(new Event('des-auth-changed'));
      setToken(data.token);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction('');
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setBusyAction('product');
    const payload = { ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : '' };
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
    if (file) formData.append('image', file);

    try {
      const response = await fetch(`${API}/api/products${edit ? `/${edit}` : ''}`, {
        method: edit ? 'PUT' : 'POST',
        headers: auth,
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error);
      const nextProducts = edit
        ? products.map((product) => String(product._id) === String(edit) ? data : product)
        : [data, ...products];
      setProducts(nextProducts);
      localStorage.setItem('des-products', JSON.stringify(nextProducts));
      const nextCategories = [...new Map([...savedCategories, form.category].filter(Boolean).map((category) => [category.trim().toLowerCase(), category.trim()])).values()];
      setSavedCategories(nextCategories);
      localStorage.setItem('des-categories', JSON.stringify(nextCategories));
      setForm(emptyProduct);
      setSpecifyingCategory(false);
      setFile(null);
      setEdit(null);
      setError('');
      notify('Product saved');
      scrollToPageTop();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction('');
    }
  };

  const removeProduct = async (id) => {
    setBusyAction(`delete-product:${id}`);
    try {
      const response = await fetch(`${API}/api/products/${id}`, { method: 'DELETE', headers: auth });
      if (!response.ok) throw new Error('Could not delete product');
      const nextProducts = products.filter((product) => String(product._id) !== String(id));
      setProducts(nextProducts);
      localStorage.setItem('des-products', JSON.stringify(nextProducts));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction('');
    }
  };

  const saveDelivery = async () => {
    setBusyAction('delivery');
    try {
      const response = await fetch(`${API}/api/settings`, {
        method: 'PUT',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingZones }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not save shipping settings');
      setDelivery(data.deliveryFee);
      localStorage.setItem('des-delivery', String(data.deliveryFee));
      setShippingZones(data.shippingZones);
      notify('Shipping settings saved');
      scrollToPageTop();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction('');
    }
  };

  const savePost = async (event) => {
    event.preventDefault();
    setBusyAction('post');
    const body = new FormData();
    Object.entries(postForm).forEach(([key, value]) => body.append(key, String(value)));
    if (postFile) body.append('image', postFile);
    try {
      const response = await fetch(`${API}/api/blog${editPost ? `/${editPost}` : ''}`, {
        method: editPost ? 'PUT' : 'POST', headers: auth, body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not save blog post');
      setPosts((current) => editPost ? current.map((post) => post._id === data._id ? data : post) : [data, ...current]);
      setPostForm(emptyPost); setPostFile(null); setEditPost(null); setError('');
      notify(data.published ? 'Blog post published' : 'Draft saved');
      scrollToPageTop();
    } catch (err) { setError(err.message); }
    finally { setBusyAction(''); }
  };

  const deletePost = async (id) => {
    setBusyAction(`delete-post:${id}`);
    try {
      const response = await fetch(`${API}/api/blog/${id}`, { method: 'DELETE', headers: auth });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not delete blog post');
      setPosts((current) => current.filter((post) => post._id !== id));
    } catch (err) { setError(err.message); }
    finally { setBusyAction(''); }
  };

  if (!token) {
    return (
      <main className="page admin-page">
        <h1>Admin dashboard</h1>
        <p>Sign in with an admin account to manage the live catalogue.</p>
        <form onSubmit={loginAdmin}>
          <label>Email<input type="email" required value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} /></label>
          <label>Password<input type="password" required value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /></label>
          <button className="shop-now" disabled={busyAction === 'login'}>{busyAction === 'login' ? <><LoaderCircle className="button-spinner" size={17} /> SIGNING IN...</> : 'SIGN IN'}</button>
          <p className="error">{error}</p>
        </form>
      </main>
    );
  }

  return (
    <main className="page admin-page">
      <h1>Admin dashboard</h1>
      <p>Manage live product names, categories, photos, prices and discounts.</p>
      <form ref={productFormRef} className="admin-form" onSubmit={saveProduct}>
        <h2>{edit ? 'Edit product' : 'Add product'}</h2>
        <label>Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Category<select required value={specifyingCategory ? specifyCategory : form.category} onChange={(event) => {
          if (event.target.value === specifyCategory) { setSpecifyingCategory(true); setForm({ ...form, category: '' }); }
          else { setSpecifyingCategory(false); setForm({ ...form, category: event.target.value }); }
        }}><option value="" disabled>Select a category</option>{productCategories.map((category) => <option key={category} value={category}>{category}</option>)}<option value={specifyCategory}>Please specify</option></select></label>
        {specifyingCategory && <label>New category<input required autoFocus value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>}
        <label>Current price (£)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
        <label>Original price (£), if discounted<input type="number" min="0.01" step="0.01" value={form.originalPrice} onChange={(event) => setForm({ ...form, originalPrice: event.target.value })} /></label>
        <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label>Product image<input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
        <div className="form-actions">
          <button className="shop-now" disabled={busyAction === 'product'}>{busyAction === 'product' ? <><LoaderCircle className="button-spinner" size={17} /> SAVING PRODUCT...</> : 'SAVE PRODUCT'}</button>
          {edit && <button type="button" onClick={() => { setEdit(null); setForm(emptyProduct); setFile(null); setSpecifyingCategory(false); scrollToPageTop(); }}>Cancel</button>}
        </div>
        <p className="error">{error}</p>
      </form>
      <h2>Products ({products.length})</h2>
      <ImportStarters token={token} onImported={setProducts} />
      <div className="admin-products">
        {products.map((product) => (
          <div key={product._id || product.id}>
            <img src={imageOf(product)} alt="" />
            <span>{product.name}<small>{product.category} · {Number(product.price) > 0 ? money(product.price) : 'No price'}{Number(product.originalPrice) > Number(product.price) ? ` (was ${money(product.originalPrice)})` : ''}</small></span>
            {product._id && <>
              <button onClick={() => {
                setEdit(product._id);
                setForm({ name: product.name, category: product.category, price: product.price, originalPrice: product.originalPrice || '', description: product.description || '' });
                setSpecifyingCategory(false);
                setFile(null);
                scrollToAdminForm(productFormRef);
              }}>Edit</button>
              <button disabled={busyAction === `delete-product:${product._id}`} onClick={() => removeProduct(product._id)}>{busyAction === `delete-product:${product._id}` ? 'Deleting…' : 'Delete'}</button>
            </>}
          </div>
        ))}
      </div>
      <section className="delivery-control">
        <h2>Shipping fees and destinations</h2>
        <p>Choose the countries included in each shipping zone and set a flat fee for that destination group.</p>
        {shippingZones.map((zone, index) => <div className="shipping-zone-editor" key={index}>
          <label>Zone name<input value={zone.name} onChange={(event) => setShippingZones((zones) => zones.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} /></label>
          <label>Shipping countries<select value={countrySelection} onChange={(event) => {
            const code = event.target.value;
            setCountrySelection(code);
            if (code && code !== otherCountry && !shippingZones.some((item, i) => i !== index && item.countries.includes(code))) setShippingZones((zones) => zones.map((item, i) => i === index ? { ...item, countries: [...item.countries, code] } : item));
            if (code !== otherCountry) setCountrySelection('');
          }}><option value="">Add a country</option>{countryOptions.filter(({ code }) => !shippingZones.some((item, i) => i !== index && item.countries.includes(code)) && !zone.countries.includes(code)).map(({ code, name }) => <option key={code} value={code}>{name}</option>)}<option value={otherCountry}>Other (please specify)</option></select></label>
          {countrySelection === otherCountry && <div className="shipping-other-country"><label>Specify country<input value={otherCountryName} onChange={(event) => setOtherCountryName(event.target.value)} placeholder="Enter a country name" /></label><button type="button" disabled={!specifiedCountry || zone.countries.includes(specifiedCountry.code) || shippingZones.some((item, i) => i !== index && item.countries.includes(specifiedCountry?.code))} onClick={() => { setShippingZones((zones) => zones.map((item, i) => i === index ? { ...item, countries: [...item.countries, specifiedCountry.code] } : item)); setOtherCountryName(''); setCountrySelection(''); }}>ADD COUNTRY</button><small>{otherCountryName && !specifiedCountry ? 'Country not found. Choose a country from the dropdown list.' : 'Enter a country name, then add it to this zone.'}</small></div>}
          <div className="shipping-country-tags">{zone.countries.map((code) => <span key={code}>{countryOptions.find((country) => country.code === code)?.name || `Other (${code})`}<button type="button" aria-label={`Remove ${code}`} onClick={() => setShippingZones((zones) => zones.map((item, i) => i === index ? { ...item, countries: item.countries.filter((country) => country !== code) } : item))}>×</button></span>)}</div>
          <label>Shipping fee (£)<input type="number" min="0" step="0.01" value={zone.fee} onChange={(event) => setShippingZones((zones) => zones.map((item, i) => i === index ? { ...item, fee: event.target.value } : item))} /></label>
          <button type="button" onClick={() => setShippingZones((zones) => zones.filter((_, i) => i !== index))}>Remove zone</button>
        </div>)}
        <button type="button" onClick={() => { setShippingZones((zones) => [...zones, { name: '', countries: [], fee: 0 }]); setCountrySelection(''); }}>ADD SHIPPING ZONE</button>
        <button className="shop-now" type="button" disabled={busyAction === 'delivery'} onClick={saveDelivery}>{busyAction === 'delivery' ? <><LoaderCircle className="button-spinner" size={17} /> SAVING...</> : 'SAVE SHIPPING SETTINGS'}</button>
      </section>
      <form ref={postFormRef} className="admin-form blog-studio" onSubmit={savePost}>
        <h2>{editPost ? 'Edit article' : 'Blog content studio'}</h2>
        <p>Create articles, save drafts, and publish them to the public blog page.</p>
        <label>Title<input required maxLength="180" value={postForm.title} onChange={(event) => setPostForm({ ...postForm, title: event.target.value })} /></label>
        <label>Short introduction<textarea maxLength="320" rows="3" value={postForm.excerpt} onChange={(event) => setPostForm({ ...postForm, excerpt: event.target.value })} /></label>
        <label>Article content<textarea required rows="12" value={postForm.content} onChange={(event) => setPostForm({ ...postForm, content: event.target.value })} /></label>
        <label>Cover image<input type="file" accept="image/*" onChange={(event) => setPostFile(event.target.files?.[0] || null)} /></label>
        <label className="blog-publish"><input type="checkbox" checked={postForm.published} onChange={(event) => setPostForm({ ...postForm, published: event.target.checked })} /> Publish on the blog</label>
        <div className="form-actions"><button className="shop-now" disabled={busyAction === 'post'}>{busyAction === 'post' ? <><LoaderCircle className="button-spinner" size={17} /> SAVING ARTICLE...</> : 'SAVE ARTICLE'}</button>{editPost && <button type="button" onClick={() => { setEditPost(null); setPostForm(emptyPost); setPostFile(null); scrollToPageTop(); }}>Cancel</button>}</div>
        <p className="error">{error}</p>
      </form>
      <h2>Blog articles ({posts.length})</h2>
      <button className="admin-import" type="button" disabled={busyAction === 'import-blog'} onClick={async () => {
        setBusyAction('import-blog');
        try {
          const response = await fetch(`${API}/api/blog/import-beauty-guides`, { method: 'POST', headers: auth });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Could not import beauty guides');
          if (data.posts?.length) setPosts((current) => [...data.posts, ...current]);
          notify(data.imported ? `Imported ${data.imported} articles${data.skipped ? `; ${data.skipped} already existed` : ''}` : 'All 20 articles are already imported');
        } catch (err) { setError(err.message); }
        finally { setBusyAction(''); }
      }}>{busyAction === 'import-blog' ? <><LoaderCircle className="button-spinner" size={17} /> IMPORTING ARTICLES...</> : 'IMPORT 20 BEAUTY & HYGIENE ARTICLES'}</button>
      <div className="admin-products">{posts.map((post) => <div key={post._id}>{post.image && <img src={post.image} alt="" />}<span>{post.title}<small>{post.published ? 'Published' : 'Draft'} · {new Date(post.createdAt).toLocaleDateString()}</small></span><button onClick={() => { setEditPost(post._id); setPostForm({ title: post.title, excerpt: post.excerpt || '', content: post.content, published: post.published }); setPostFile(null); scrollToAdminForm(postFormRef); }}>Edit</button><button disabled={busyAction === `delete-post:${post._id}`} onClick={() => deletePost(post._id)}>{busyAction === `delete-post:${post._id}` ? 'Deleting…' : 'Delete'}</button></div>)}</div>
    </main>
  );
}

function ImportStarters({ token, onImported }) {
  const [busy, setBusy] = useState(false);
  return (
    <button className="admin-import" disabled={busy} onClick={async () => {
      setBusy(true);
      try {
        const response = await fetch(`${API}/api/products/import-starters`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not import starter products');
        const catalog = data.products;
        onImported(catalog);
        localStorage.setItem('des-products', JSON.stringify(catalog));
        scrollToPageTop();
      } catch (err) {
        alert(err.message);
      } finally {
        setBusy(false);
      }
    }}>{busy ? <><LoaderCircle className="button-spinner" size={17} /> UPDATING CATALOGUE…</> : 'IMPORT STARTERS AND UPDATE PRICES'}</button>
  );
}
