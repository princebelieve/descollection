import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function CheckoutResult({success}){const {setCart}=useStore();useEffect(()=>{if(success){setCart([]);localStorage.removeItem('des-cart')}},[success,setCart]);return <main className="page text-page"><p className="kicker">{success?'ORDER RECEIVED':'CHECKOUT CANCELLED'}</p><h1>{success?'Thank you for shopping with us':'Your cart is still here'}</h1><p>{success?'Your payment was completed. We appreciate your order.':'No payment was taken. You can return to your cart whenever you are ready.'}</p><Link className="shop-now" to={success?'/shop':'/cart'}>{success?'CONTINUE SHOPPING':'RETURN TO CART'}</Link></main>}
