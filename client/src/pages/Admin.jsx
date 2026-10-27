import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoaderCircle, Printer, Trash2 } from 'lucide-react';
import { API, categories } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { imageOf, money } from '../utils/products';
import PasswordInput from '../components/PasswordInput';

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
  const location = useLocation();
  const navigate = useNavigate();
  const section = location.pathname.split('/')[2] || 'products';
  const validSections = ['products', 'product-form', 'shipping', 'orders', 'blog', 'articles'];
  const isProducts = section === 'products';
  const isProductForm = section === 'product-form';
  const isShipping = section === 'shipping';
  const isOrders = section === 'orders';
  const isBlogEditor = section === 'blog';
  const isBlogArticles = section === 'articles';
  const [token, setToken] = useState(localStorage.getItem('des-role') === 'admin' ? localStorage.getItem('des-token') || '' : '');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [form, setForm] = useState(emptyProduct);
  const [specifyingCategory, setSpecifyingCategory] = useState(false);
  const [savedCategories, setSavedCategories] = useState(loadSavedCategories);
  const [file, setFile] = useState(null);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [printingOrderId, setPrintingOrderId] = useState('');
  const [postForm, setPostForm] = useState(emptyPost);
  const [postFile, setPostFile] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [shippingZones, setShippingZones] = useState([{ name: 'United Kingdom', countries: ['GB'], fee: delivery }]);
  const [zoneDraft, setZoneDraft] = useState(null);
  const [editingZoneIndex, setEditingZoneIndex] = useState(null);
  const [countrySelection, setCountrySelection] = useState('');
  const [otherCountryName, setOtherCountryName] = useState('');
  const specifiedCountry = countryOptions.find(({ name }) => name.toLowerCase() === otherCountryName.trim().toLowerCase());
  const productFormRef = useRef(null);
  const postFormRef = useRef(null);
  const auth = { Authorization: `Bearer ${token}` };
  const productCategories = [...new Map([...categories.filter((category) => category !== 'Brands' && category !== 'More'), ...savedCategories, ...products.map((product) => product.category)].filter(Boolean).map((category) => [category.trim().toLowerCase(), category.trim()])).values()].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (location.pathname === '/admin' || !validSections.includes(section)) navigate('/admin/products', { replace: true });
  }, [location.pathname, navigate, section]);

  useEffect(() => {
    if (isBlogEditor && editPost) scrollToAdminForm(postFormRef);
  }, [isBlogEditor, editPost]);

  useEffect(() => {
    if (!printingOrderId) return undefined;
    const finishPrint = () => setPrintingOrderId('');
    window.addEventListener('afterprint', finishPrint);
    return () => window.removeEventListener('afterprint', finishPrint);
  }, [printingOrderId]);

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
    if (isOrders) {
      fetch(`${API}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Could not load orders');
          setOrders(data);
        })
        .catch((err) => setError(err.message));
    }
  }, [token, isOrders]);

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
      navigate('/admin/products');
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

  const sendOrderToWhatsApp = async (id) => {
    setBusyAction(`whatsapp:${id}`);
    try {
      const response = await fetch(`${API}/api/orders/${id}/notify-whatsapp`, { method: 'POST', headers: auth });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not send WhatsApp notification');
      setOrders((current) => current.map((order) => order._id === id ? { ...order, whatsappNotifiedAt: data.whatsappNotifiedAt, whatsappNotificationError: '' } : order));
      notify('Order sent to WhatsApp');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction('');
    }
  };

  const printOrder = (id) => {
    setPrintingOrderId(id);
    window.requestAnimationFrame(() => window.print());
  };

  const deleteOrder = async (order) => {
    if (!window.confirm(`Permanently delete order ${order.stripeSessionId?.slice(-10) || order._id} from this app? This does not refund or delete the Stripe payment. Continue only if you have confirmed this order should be removed.`)) return;
    setBusyAction(`delete-order:${order._id}`);
    try {
      const response = await fetch(`${API}/api/orders/${order._id}`, { method: 'DELETE', headers: auth });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not delete the order');
      setOrders((current) => current.filter((item) => item._id !== order._id));
      notify('Order deleted from this app');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction('');
    }
  };

  if (!token) {
    return (
      <main className="page admin-page">
        <h1>Admin dashboard</h1>
        <p>Sign in with an admin account to manage the live catalogue.</p>
        <form onSubmit={loginAdmin}>
          <label>Email<input type="email" required value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} /></label>
          <label>Password<PasswordInput autoComplete="current-password" required value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /></label>
          <button className="shop-now" disabled={busyAction === 'login'}>{busyAction === 'login' ? <><LoaderCircle className="button-spinner" size={17} /> SIGNING IN...</> : 'SIGN IN'}</button>
          <p className="error">{error}</p>
        </form>
      </main>
    );
  }

  return (
    <main className="page admin-page admin-dashboard">
      <aside className="admin-side-menu" aria-label="Admin dashboard sections">
        <h2>Admin menu</h2>
        <Link to="/admin/product-form" aria-current={isProductForm ? 'page' : undefined}>Add product</Link>
        <Link to="/admin/products" aria-current={isProducts ? 'page' : undefined}>Products</Link>
        <Link to="/admin/shipping" aria-current={isShipping ? 'page' : undefined}>Shipping settings</Link>
        <Link to="/admin/orders" aria-current={isOrders ? 'page' : undefined}>Orders</Link>
        <Link to="/admin/blog" aria-current={isBlogEditor ? 'page' : undefined}>Create blog post</Link>
        <Link to="/admin/articles" aria-current={isBlogArticles ? 'page' : undefined}>Blog articles</Link>
      </aside>
      <div className="admin-dashboard-content">
      <h1>{isProducts ? 'Products' : isProductForm ? (edit ? 'Edit product' : 'Add product') : isShipping ? 'Shipping settings' : isOrders ? 'Orders' : isBlogEditor ? 'Create blog post' : 'Blog articles'}</h1>
      {isOrders && error && <p className="error" role="alert">{error}</p>}
      {(isProducts || isProductForm) && <>
      <p>Manage live product names, categories, photos, prices and discounts.</p>
      </>}
      {isProductForm && <>
      <form id="product-management" ref={productFormRef} className="admin-form" onSubmit={saveProduct}>
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
          {edit && <button type="button" onClick={() => { setEdit(null); setForm(emptyProduct); setFile(null); setSpecifyingCategory(false); navigate('/admin/products'); }}>Cancel</button>}
        </div>
        <p className="error">{error}</p>
      </form>
      </>}
      {isProducts && <>
      <h2 id="products-list">Products ({products.length})</h2>
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
                navigate('/admin/product-form');
              }}>Edit</button>
              <button disabled={busyAction === `delete-product:${product._id}`} onClick={() => removeProduct(product._id)}>{busyAction === `delete-product:${product._id}` ? 'Deleting…' : 'Delete'}</button>
            </>}
          </div>
        ))}
      </div>
      </>}
      {isOrders && <section className="admin-orders" aria-label="Customer orders">
        <p>Paid and pending Stripe orders, including the delivery address entered during checkout.</p>
        {orders.length ? orders.map((order) => {
          let items = [];
          try { items = JSON.parse(order.items || '[]'); } catch { /* Older orders may contain legacy item IDs. */ }
          const address = [order.deliveryAddress, order.deliveryAddress2, order.deliveryCity, order.deliveryState, order.deliveryPostcode, order.deliveryCountry].filter(Boolean).join(', ');
          const isTestOrder = order.stripeSessionId?.startsWith('cs_test_');
          return <article className={`admin-order-card${printingOrderId === order._id ? ' print-target' : ''}`} key={order._id}>
            <header><div>{isTestOrder && <span className="admin-order-test-label">STRIPE TEST ORDER</span>}<h2>Order {order.stripeSessionId?.slice(-10).toUpperCase() || order._id}</h2><time>{new Date(order.createdAt).toLocaleString()}</time></div><strong className={`admin-order-status status-${order.status}`}>{order.status}</strong></header>
            <div className="admin-order-columns">
              <section><h3>Customer</h3><p>{order.customerName || 'Name not provided'}</p><p>{order.customerEmail || 'Email not provided'}</p><p>{order.customerPhone || 'Phone not provided'}</p></section>
              <section><h3>Delivery address</h3><p>{address || 'No delivery address recorded'}</p></section>
              <section><h3>Items</h3>{items.length ? <ul>{items.map((item, index) => <li key={`${item.name || item.id}-${index}`}>{item.name || item.description || item.id || 'Item'} × {item.quantity || item.qty || 1}{item.amount != null ? ` · ${money(item.amount)}` : ''}</li>)}</ul> : <p>Items recorded in the payment metadata.</p>}<b>Total: {money(order.amount)}</b></section>
            </div>
            <div className="admin-order-communication">
              <div className="admin-order-whatsapp"><span>Store WhatsApp: {order.whatsappNotifiedAt ? `sent ${new Date(order.whatsappNotifiedAt).toLocaleString()}${order.whatsappDeliveryStatus ? ` · ${order.whatsappDeliveryStatus}` : ''}${order.whatsappDeliveryError ? ` · ${order.whatsappDeliveryError}` : ''}` : order.whatsappNotificationError ? `failed: ${order.whatsappNotificationError}` : 'not configured or not sent'}</span>{order.status === 'paid' && !order.whatsappNotifiedAt && <button type="button" disabled={busyAction === `whatsapp:${order._id}`} onClick={() => sendOrderToWhatsApp(order._id)}>{busyAction === `whatsapp:${order._id}` ? 'SENDING…' : order.whatsappNotificationError ? 'RETRY WHATSAPP' : 'SEND TO WHATSAPP'}</button>}</div>
              {order.customerWhatsappOptIn && <p className="admin-customer-whatsapp">Customer WhatsApp: {order.customerWhatsappNotifiedAt ? `sent${order.customerWhatsappDeliveryStatus ? ` · ${order.customerWhatsappDeliveryStatus}` : ''}${order.customerWhatsappDeliveryError ? ` · ${order.customerWhatsappDeliveryError}` : ''}` : order.customerWhatsappNotificationError ? `failed: ${order.customerWhatsappNotificationError}` : 'opted in; waiting to send'}</p>}
              {order.whatsappReplies?.length > 0 && <div className="admin-whatsapp-replies"><h3>Customer WhatsApp replies</h3>{order.whatsappReplies.map((reply) => <p key={reply.messageId}><time>{new Date(reply.receivedAt).toLocaleString()}</time><span>{reply.text}</span></p>)}</div>}
            </div>
            <div className="admin-order-actions">
              <button type="button" onClick={() => printOrder(order._id)}><Printer size={16} /> PRINT ORDER</button>
              <button type="button" disabled={busyAction === `delete-order:${order._id}`} onClick={() => deleteOrder(order)}><Trash2 size={16} /> {busyAction === `delete-order:${order._id}` ? 'DELETING…' : 'DELETE ORDER'}</button>
            </div>
          </article>;
        }) : <p className="shipping-empty">No Stripe orders have been recorded yet.</p>}
      </section>}
      {isShipping && <>
      <section id="shipping-settings" className="delivery-control">
        <h2>Shipping fees and destinations</h2>
        <p>Create destination groups and flat fees. Select a zone below to change it.</p>
        {shippingZones.length > 0 ? <div className="shipping-zone-list">{shippingZones.map((zone, index) => <article className="shipping-zone-card" key={`${zone.name}-${index}`}>
          <div><h3>{zone.name}</h3><p>{zone.countries.map((code) => countryOptions.find((country) => country.code === code)?.name || code).join(', ') || 'No countries selected'}</p></div>
          <strong>{money(Number(zone.fee) || 0)}</strong>
          {!zoneDraft && <div className="shipping-zone-actions"><button type="button" onClick={() => { setZoneDraft({ ...zone, countries: [...zone.countries] }); setEditingZoneIndex(index); setCountrySelection(''); }}>Edit</button><button type="button" onClick={() => setShippingZones((zones) => zones.filter((_, i) => i !== index))}>Remove</button></div>}
        </article>)}</div> : <p className="shipping-empty">No shipping zones yet. Add a zone to make delivery available.</p>}
        {!zoneDraft && <button type="button" onClick={() => { setZoneDraft({ name: '', countries: [], fee: 0 }); setEditingZoneIndex(-1); setCountrySelection(''); }}>ADD SHIPPING ZONE</button>}
        {zoneDraft && <div className="shipping-zone-editor">
          <h3>{editingZoneIndex === -1 ? 'Add shipping zone' : `Edit ${zoneDraft.name || 'shipping zone'}`}</h3>
          <label>Zone name<input value={zoneDraft.name} onChange={(event) => setZoneDraft((zone) => ({ ...zone, name: event.target.value }))} placeholder="For example, West Africa" /></label>
          <label>Add destinations<CountryPicker countries={countryOptions.filter(({ code }) => !zoneDraft.countries.includes(code) && !shippingZones.some((zone, index) => index !== editingZoneIndex && zone.countries.includes(code)))} onSelect={(code) => setZoneDraft((zone) => ({ ...zone, countries: [...zone.countries, code] }))} onOther={() => setCountrySelection(otherCountry)} /></label>
          {countrySelection === otherCountry && <div className="shipping-other-country"><label>Specify country<input value={otherCountryName} onChange={(event) => setOtherCountryName(event.target.value)} placeholder="Enter a country name" /></label><button type="button" disabled={!specifiedCountry || zoneDraft.countries.includes(specifiedCountry.code) || shippingZones.some((zone, index) => index !== editingZoneIndex && zone.countries.includes(specifiedCountry?.code))} onClick={() => { setZoneDraft((zone) => ({ ...zone, countries: [...zone.countries, specifiedCountry.code] })); setOtherCountryName(''); setCountrySelection(''); }}>ADD COUNTRY</button><small>{otherCountryName && !specifiedCountry ? 'Country not found. Search and select it above.' : 'Enter a country name, then add it to this zone.'}</small></div>}
          <div className="shipping-country-tags">{zoneDraft.countries.map((code) => <span key={code}>{countryOptions.find((country) => country.code === code)?.name || code}<button type="button" aria-label={`Remove ${code}`} onClick={() => setZoneDraft((zone) => ({ ...zone, countries: zone.countries.filter((country) => country !== code) }))}>×</button></span>)}</div>
          <label>Shipping fee (£)<input type="number" min="0" step="0.01" value={zoneDraft.fee} onChange={(event) => setZoneDraft((zone) => ({ ...zone, fee: event.target.value }))} /></label>
          <div className="shipping-zone-actions"><button type="button" disabled={!zoneDraft.name.trim() || !zoneDraft.countries.length || !Number.isFinite(Number(zoneDraft.fee)) || Number(zoneDraft.fee) < 0} onClick={() => { setShippingZones((zones) => editingZoneIndex === -1 ? [...zones, { ...zoneDraft, fee: Number(zoneDraft.fee) }] : zones.map((zone, index) => index === editingZoneIndex ? { ...zoneDraft, fee: Number(zoneDraft.fee) } : zone)); setZoneDraft(null); setEditingZoneIndex(null); setCountrySelection(''); }}>SAVE ZONE</button><button type="button" onClick={() => { setZoneDraft(null); setEditingZoneIndex(null); setCountrySelection(''); }}>CANCEL</button></div>
        </div>}
        <button className="shop-now" type="button" disabled={busyAction === 'delivery' || shippingZones.length === 0 || Boolean(zoneDraft)} onClick={saveDelivery}>{busyAction === 'delivery' ? <><LoaderCircle className="button-spinner" size={17} /> SAVING...</> : 'SAVE SHIPPING SETTINGS'}</button>
      </section>
      </>}
      {isBlogEditor && <>
      <form id="blog-editor" ref={postFormRef} className="admin-form blog-studio" onSubmit={savePost}>
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
      </>}
      {isBlogArticles && <>
      <h2 id="blog-list">Blog articles ({posts.length})</h2>
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
      <div className="admin-products">{posts.map((post) => <div key={post._id}>{post.image && <img src={post.image} alt="" />}<span>{post.title}<small>{post.published ? 'Published' : 'Draft'} · {new Date(post.createdAt).toLocaleDateString()}</small></span><button onClick={() => { setEditPost(post._id); setPostForm({ title: post.title, excerpt: post.excerpt || '', content: post.content, published: post.published }); setPostFile(null); navigate('/admin/blog'); }}>Edit</button><button disabled={busyAction === `delete-post:${post._id}`} onClick={() => deletePost(post._id)}>{busyAction === `delete-post:${post._id}` ? 'Deleting…' : 'Delete'}</button></div>)}</div>
      </>}
      </div>
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

function CountryPicker({ countries, onSelect, onOther }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const matches = countries.filter((country) => country.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="country-picker">
      <button className="country-picker-trigger" type="button" aria-expanded={open} onClick={() => { setOpen((value) => !value); setQuery(''); }}>
        {open ? 'Country list open' : 'Choose a country'}
      </button>
      {open && <div className="country-picker-menu">
        <input autoFocus type="search" aria-label="Search countries" placeholder="Search countries…" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="country-picker-options" role="listbox" aria-label="Countries">
          {matches.map(({ code, name }) => <button type="button" role="option" key={code} onClick={() => { onSelect(code); setOpen(false); setQuery(''); }}>{name}</button>)}
          {matches.length === 0 && <p>No matching countries</p>}
          <button className="country-picker-other" type="button" onClick={() => { onOther(); setOpen(false); setQuery(''); }}>Other (please specify)</button>
        </div>
      </div>}
    </div>
  );
}
