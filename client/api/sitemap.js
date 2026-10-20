const SITE_URL = "https://descollection.co.uk";
const staticPaths = [
  "/", "/shop", "/brands", "/about", "/blog", "/faq", "/contact",
  "/category/Body%20Lotions", "/category/Body%20Wash", "/category/Serum",
  "/category/Oil", "/category/Face%20Cream", "/category/Soap",
  "/category/Creams", "/category/Scrub", "/category/Set", "/category/Toner",
  "/category/Cleanser", "/category/Fragrances", "/category/Hair%20Care",
];

const escapeXml = (value) => String(value).replace(/[<>&'\"]/g, (char) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;",
}[char]));

export default async function sitemap(_request, response) {
  const apiUrl = (process.env.SITEMAP_API_URL || process.env.VITE_API_URL || process.env.API_URL || "").replace(/\/$/, "");
  let products = [];
  let posts = [];

  if (apiUrl) {
    try {
      const [productResponse, postResponse] = await Promise.all([
        fetch(`${apiUrl}/api/products`),
        fetch(`${apiUrl}/api/blog`),
      ]);
      if (productResponse.ok) products = await productResponse.json();
      if (postResponse.ok) posts = await postResponse.json();
    } catch (error) {
      console.error("Could not fetch dynamic sitemap URLs", error);
    }
  }

  const urls = [
    ...staticPaths.map((path) => ({ loc: `${SITE_URL}${path}` })),
    ...products.map((product) => ({ loc: `${SITE_URL}/product/${encodeURIComponent(product._id || product.id)}`, updatedAt: product.updatedAt })),
    ...posts.map((post) => ({ loc: `${SITE_URL}/blog/${encodeURIComponent(post._id)}`, updatedAt: post.updatedAt })),
  ];
  const entries = urls.map(({ loc, updatedAt }) => `  <url><loc>${escapeXml(loc)}</loc>${updatedAt ? `<lastmod>${new Date(updatedAt).toISOString().slice(0, 10)}</lastmod>` : ""}</url>`).join("\n");

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  response.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`);
};
