export const money = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n) || 0);
export const productId = (product) => String(product?._id || product?.id || '');
export const imageOf = (product) => product?.image?.startsWith('http') || product?.image?.startsWith('data:') ? product.image : product?.image?.startsWith('/') ? product.image : `/${product?.image || ''}`;
