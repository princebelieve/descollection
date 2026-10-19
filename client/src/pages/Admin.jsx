import { useEffect, useState } from 'react';
import { API, categories } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { imageOf, money } from '../utils/products';

const emptyProduct = { name: '', category: '', price: '', originalPrice: '', description: '' };
const emptyPost = { title: '', excerpt: '', content: '', published: false };

export default function Admin() {
  const { products, setProducts, delivery, setDelivery, notify } = useStore();
  const [token, setToken] = useState(localStorage.getItem('des-role') === 'admin' ? localStorage.getItem('des-token') || '' : '');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [form, setForm] = useState(emptyProduct);
  const [file, setFile] = useState(null);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState(emptyPost);
  const [postFile, setPostFile] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const auth = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
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
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
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
      setForm(emptyProduct);
      setFile(null);
      setEdit(null);
      setError('');
      notify('Product saved');
    } catch (err) {
      setError(err.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await fetch(`${API}/api/products/${id}`, { method: 'DELETE', headers: auth });
      if (!response.ok) throw new Error('Could not delete product');
      const nextProducts = products.filter((product) => String(product._id) !== String(id));
      setProducts(nextProducts);
      localStorage.setItem('des-products', JSON.stringify(nextProducts));
    } catch (err) {
      setError(err.message);
    }
  };

  const saveDelivery = async () => {
    try {
      const response = await fetch(`${API}/api/settings`, {
        method: 'PUT',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryFee: delivery }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not save delivery fee');
      setDelivery(data.deliveryFee);
      localStorage.setItem('des-delivery', String(data.deliveryFee));
      notify('Delivery fee saved');
    } catch (err) {
      setError(err.message);
    }
  };

  const savePost = async (event) => {
    event.preventDefault();
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
    } catch (err) { setError(err.message); }
  };

  const deletePost = async (id) => {
    try {
      const response = await fetch(`${API}/api/blog/${id}`, { method: 'DELETE', headers: auth });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not delete blog post');
      setPosts((current) => current.filter((post) => post._id !== id));
    } catch (err) { setError(err.message); }
  };

  if (!token) {
    return (
      <main className="page admin-page">
        <h1>Admin dashboard</h1>
        <p>Sign in with an admin account to manage the live catalogue.</p>
        <form onSubmit={loginAdmin}>
          <label>Email<input type="email" required value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} /></label>
          <label>Password<input type="password" required value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /></label>
          <button className="shop-now">SIGN IN</button>
          <p className="error">{error}</p>
        </form>
      </main>
    );
  }

  return (
    <main className="page admin-page">
      <h1>Admin dashboard</h1>
      <p>Manage live product names, categories, photos, prices and discounts.</p>
      <form className="admin-form" onSubmit={saveProduct}>
        <h2>{edit ? 'Edit product' : 'Add product'}</h2>
        <label>Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
        <label>Current price (£)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
        <label>Original price (£), if discounted<input type="number" min="0.01" step="0.01" value={form.originalPrice} onChange={(event) => setForm({ ...form, originalPrice: event.target.value })} /></label>
        <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label>Product image<input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
        <div className="form-actions">
          <button className="shop-now">SAVE PRODUCT</button>
          {edit && <button type="button" onClick={() => { setEdit(null); setForm(emptyProduct); setFile(null); }}>Cancel</button>}
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
              }}>Edit</button>
              <button onClick={() => removeProduct(product._id)}>Delete</button>
            </>}
          </div>
        ))}
      </div>
      <label className="delivery-control">Delivery fee (£)<input type="number" min="0" step="0.01" value={delivery} onChange={(event) => { setDelivery(Number(event.target.value)); localStorage.setItem('des-delivery', event.target.value); }} /></label>
      <button className="shop-now" type="button" onClick={saveDelivery}>SAVE DELIVERY FEE</button>
      <form className="admin-form blog-studio" onSubmit={savePost}>
        <h2>{editPost ? 'Edit article' : 'Blog content studio'}</h2>
        <p>Create articles, save drafts, and publish them to the public blog page.</p>
        <label>Title<input required maxLength="180" value={postForm.title} onChange={(event) => setPostForm({ ...postForm, title: event.target.value })} /></label>
        <label>Short introduction<textarea maxLength="320" rows="3" value={postForm.excerpt} onChange={(event) => setPostForm({ ...postForm, excerpt: event.target.value })} /></label>
        <label>Article content<textarea required rows="12" value={postForm.content} onChange={(event) => setPostForm({ ...postForm, content: event.target.value })} /></label>
        <label>Cover image<input type="file" accept="image/*" onChange={(event) => setPostFile(event.target.files?.[0] || null)} /></label>
        <label className="blog-publish"><input type="checkbox" checked={postForm.published} onChange={(event) => setPostForm({ ...postForm, published: event.target.checked })} /> Publish on the blog</label>
        <div className="form-actions"><button className="shop-now">{editPost ? 'SAVE ARTICLE' : 'SAVE ARTICLE'}</button>{editPost && <button type="button" onClick={() => { setEditPost(null); setPostForm(emptyPost); setPostFile(null); }}>Cancel</button>}</div>
        <p className="error">{error}</p>
      </form>
      <h2>Blog articles ({posts.length})</h2>
      <div className="admin-products">{posts.map((post) => <div key={post._id}>{post.image && <img src={post.image} alt="" />}<span>{post.title}<small>{post.published ? 'Published' : 'Draft'} · {new Date(post.createdAt).toLocaleDateString()}</small></span><button onClick={() => { setEditPost(post._id); setPostForm({ title: post.title, excerpt: post.excerpt || '', content: post.content, published: post.published }); setPostFile(null); }}>Edit</button><button onClick={() => deletePost(post._id)}>Delete</button></div>)}</div>
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
        const catalog = data.products.filter((product) => categories.some((category) => category.toLowerCase() === String(product.category || '').toLowerCase()));
        onImported(catalog);
        localStorage.setItem('des-products', JSON.stringify(catalog));
      } catch (err) {
        alert(err.message);
      } finally {
        setBusy(false);
      }
    }}>{busy ? 'UPDATING CATALOGUE…' : 'IMPORT STARTERS AND UPDATE PRICES'}</button>
  );
}
