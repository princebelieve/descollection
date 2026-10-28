import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API, starter } from '../data/catalog';
import { productId } from '../utils/products';

const Store = createContext(null);
export const useStore = () => useContext(Store);

export function StoreProvider({children}){
 const [products,setProducts]=useState(()=>JSON.parse(localStorage.getItem('des-products')||'null')||starter);
 const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem('des-cart')||'[]'));
 const [wishlist,setWishlist]=useState(()=>JSON.parse(localStorage.getItem('des-wishlist')||'[]'));
 const [compare,setCompare]=useState(()=>JSON.parse(localStorage.getItem('des-compare')||'[]'));
 const [delivery,setDelivery]=useState(()=>Number(localStorage.getItem('des-delivery')||0));
 const [siteSettings,setSiteSettings]=useState({});
 const [toast,setToast]=useState('');
 const [cartDrawerOpen,setCartDrawerOpen]=useState(false);
 useEffect(()=>{fetch(`${API}/api/products`).then(r=>r.ok?r.json():[]).then(data=>{const catalog=data||[];if(catalog.length){setProducts(catalog);localStorage.setItem('des-products',JSON.stringify(catalog))}}).catch(()=>{});fetch(`${API}/api/settings`).then(r=>r.ok?r.json():null).then(data=>{if(data&&Number.isFinite(Number(data.deliveryFee))){setDelivery(Number(data.deliveryFee));localStorage.setItem('des-delivery',String(data.deliveryFee))}if(data?.site)setSiteSettings(data.site)}).catch(()=>{});},[]);
 useEffect(()=>{const colors=siteSettings.colors||{};const root=document.documentElement;for(const key of ['accent','header','footer','body','card','text','metal'])root.style.setProperty(`--site-${key}`,colors[key]||'');const fonts={manrope:"Manrope,'DM Sans',Arial,sans-serif",system:"system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",arial:"Arial,Helvetica,sans-serif",trebuchet:"'Trebuchet MS',Arial,sans-serif",georgia:"Georgia,'Times New Roman',serif"};root.style.setProperty('--site-font',fonts[siteSettings.font]||fonts.manrope);root.dataset.siteTheme=['classic','soft','editorial'].includes(siteSettings.theme)?siteSettings.theme:'classic';},[siteSettings]);
 useEffect(()=>localStorage.setItem('des-cart',JSON.stringify(cart)),[cart]);useEffect(()=>localStorage.setItem('des-wishlist',JSON.stringify(wishlist)),[wishlist]);useEffect(()=>localStorage.setItem('des-compare',JSON.stringify(compare)),[compare]);
 const notify=s=>{setToast(s);setTimeout(()=>setToast(''),2400)};
 const add=(p,{openDrawer=true}={})=>{const id=productId(p);setCart(c=>{const found=c.find(x=>String(x.id)===id);return found?c.map(x=>String(x.id)===id?{...x,qty:x.qty+1}:x):[...c,{id,qty:1,product:{...p,id}}]});if(openDrawer)setCartDrawerOpen(true)};
 const openCartDrawer=()=>setCartDrawerOpen(true);
 const closeCartDrawer=()=>setCartDrawerOpen(false);
 const quantity=(id,delta)=>setCart(c=>c.map(x=>String(x.id)===String(id)?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0));
 const toggleWish=p=>{const id=productId(p);setWishlist(w=>w.some(x=>String(x.id)===id)?w.filter(x=>String(x.id)!==id):[...w,{...p,id}])};
 const toggleCompare=p=>{const id=productId(p);setCompare(items=>items.some(x=>String(x.id)===id)?items.filter(x=>String(x.id)!==id):items.length<4?[...items,{...p,id}]:items)};
 const value=useMemo(()=>({products,setProducts,cart,setCart,wishlist,toggleWish,compare,toggleCompare,delivery,setDelivery,siteSettings,setSiteSettings,add,quantity,notify,cartDrawerOpen,openCartDrawer,closeCartDrawer}),[products,cart,wishlist,compare,delivery,siteSettings,cartDrawerOpen]);
 return <Store.Provider value={value}>{children}{toast&&<div className="toast">{toast}</div>}</Store.Provider>
}
