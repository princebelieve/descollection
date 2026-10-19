import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Menu, Scale, Search, Store, UserRound } from 'lucide-react';
import { categories, menuItems } from '../../data/catalog';
import { useStore } from '../../context/StoreContext';
import CartIcon from '../icons/CartIcon';

export default function Header() {
  const { cart, wishlist, compare } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState('categories');
  const [search, setSearch] = useState(false);
  const [term, setTerm] = useState('');
  const [role, setRole] = useState(() => localStorage.getItem('des-role') || '');
  const nav = useNavigate();
  const cartCount = cart.reduce((count, item) => count + item.qty, 0);

  useEffect(() => {
    const open = () => {
      setTab('categories');
      setDrawer(true);
    };
    window.addEventListener('des-open-categories', open);
    return () => window.removeEventListener('des-open-categories', open);
  }, []);

  useEffect(() => {
    const syncAuth = () => setRole(localStorage.getItem('des-role') || '');
    window.addEventListener('des-auth-changed', syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('des-auth-changed', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const signOut = () => {
    localStorage.removeItem('des-token');
    localStorage.removeItem('des-role');
    setRole('');
    window.dispatchEvent(new Event('des-auth-changed'));
    setDrawer(false);
    nav('/');
  };

  const submit = (event) => {
    event.preventDefault();
    nav(`/shop?search=${encodeURIComponent(term)}`);
    setSearch(false);
    setDrawer(false);
  };

  return (
    <>
      <header className="topbar">
        <div className="header-group header-group-left">
          <button className="head-icon hamburger" onClick={() => { setDrawer(true); setTab('categories'); }} aria-label="Open navigation"><Menu /></button>
          <button className="head-icon compare" onClick={() => nav('/compare')} title="Compare"><Scale /><i>{compare.length}</i></button>
        </div>
        <Link className="logo" to="/"><img src="/logo.png" alt="Des-Collection" /></Link>
        <div className="header-group header-group-right">
          <button className="head-icon cart-head" onClick={() => nav('/cart')} aria-label={`Cart, ${cartCount} items`}><CartIcon /><i>{cartCount}</i></button>
          <Link className="account-head" to={role === 'admin' ? '/admin' : '/account'} aria-label={role === 'admin' ? 'Admin dashboard' : role ? 'My account' : 'Sign in or sign up'}><UserRound /><span>{role === 'admin' ? 'Admin dashboard' : role ? 'My account' : 'Sign in / Sign up'}</span></Link>
          {role && <button className="signout-head" type="button" onClick={signOut}><LogOut size={17} /><span>Sign out</span></button>}
          <button className="search-open" onClick={() => setSearch((open) => !open)} aria-expanded={search}><Search /><b>Search</b></button>
        </div>
      </header>

      {search && <form className="search-panel" onSubmit={submit}><input autoFocus placeholder="Search for products" value={term} onChange={(event) => setTerm(event.target.value)} /><button aria-label="Search"><Search /></button></form>}

      {drawer && (
        <div className="drawer-shade" onClick={() => setDrawer(false)}>
          <aside className="nav-drawer" onClick={(event) => event.stopPropagation()}>
            <form className="drawer-search" onSubmit={submit}><input placeholder="Search for products" value={term} onChange={(event) => setTerm(event.target.value)} /><button aria-label="Search"><Search /></button></form>
            <div className="drawer-tabs">
              <button className={tab === 'categories' ? 'selected' : ''} onClick={() => setTab('categories')}>CATEGORIES</button>
              <button className={tab === 'menu' ? 'selected' : ''} onClick={() => setTab('menu')}>MENU</button>
            </div>
            <div className="drawer-links">
              {tab === 'categories'
                ? categories.map((category) => <Link key={category} to={category === 'Brands' ? '/brands' : `/category/${encodeURIComponent(category)}`} onClick={() => setDrawer(false)}>{category.toUpperCase()}</Link>)
                : <>{menuItems.map(([label, path]) => <Link key={path} to={path} onClick={() => setDrawer(false)}>{label}</Link>)}{role === 'admin' && <Link to="/admin" onClick={() => setDrawer(false)}>Admin dashboard</Link>}</>}
            </div>
            {role ? <button className="drawer-account-link" type="button" onClick={signOut}><LogOut size={21} />Sign out</button> : <Link className="drawer-account-link" to="/account" onClick={() => setDrawer(false)}><UserRound size={21} />Sign in or create an account</Link>}
          </aside>
        </div>
      )}

      <BottomNav cartCount={cartCount} wishCount={wishlist.length} role={role} />
    </>
  );
}

function BottomNav({ cartCount, wishCount, role }) {
  return (
    <nav className="bottom-nav">
      <NavLink to="/shop"><span><Store /></span>Shop</NavLink>
      <NavLink to="/wishlist"><span><Heart />{wishCount > 0 && <i>{wishCount}</i>}</span>Wishlist</NavLink>
      <NavLink to="/cart"><span><CartIcon />{cartCount > 0 && <i>{cartCount}</i>}</span>Cart</NavLink>
      <NavLink to={role === 'admin' ? '/admin' : '/account'}><span><UserRound /></span>{role === 'admin' ? 'Admin' : role ? 'Account' : 'Sign in'}</NavLink>
    </nav>
  );
}
