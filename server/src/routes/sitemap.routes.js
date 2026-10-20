const express = require("express");
const Product = require("../models/Product");
const BlogPost = require("../models/BlogPost");

const router = express.Router();
const baseUrl = "https://descollection.co.uk";
const staticPaths = [
  "/", "/shop", "/brands", "/about", "/blog", "/faq", "/contact",
  "/category/Body%20Lotions", "/category/Body%20Wash", "/category/Serum",
  "/category/Oil", "/category/Face%20Cream", "/category/Soap",
  "/category/Creams", "/category/Scrub", "/category/Set", "/category/Toner",
  "/category/Cleanser", "/category/Fragrances", "/category/Hair%20Care",
];

const xmlEscape = (value) => String(value).replace(/[<>&'\"]/g, (char) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;",
}[char]));

router.get("/", async (_req, res) => {
  try {
    const [products, posts] = await Promise.all([
      Product.find({}, { _id: 1, updatedAt: 1 }).lean(),
      BlogPost.find({ published: true }, { _id: 1, updatedAt: 1 }).lean(),
    ]);
    const urls = [
      ...staticPaths.map((path) => ({ loc: `${baseUrl}${path}` })),
      ...products.map((product) => ({ loc: `${baseUrl}/product/${encodeURIComponent(product._id)}`, updatedAt: product.updatedAt })),
      ...posts.map((post) => ({ loc: `${baseUrl}/blog/${encodeURIComponent(post._id)}`, updatedAt: post.updatedAt })),
    ];
    const entries = urls.map(({ loc, updatedAt }) => `  <url><loc>${xmlEscape(loc)}</loc>${updatedAt ? `<lastmod>${new Date(updatedAt).toISOString().slice(0, 10)}</lastmod>` : ""}</url>`).join("\n");
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`);
  } catch (err) {
    res.status(500).type("text/plain").send(`Could not generate sitemap: ${err.message}`);
  }
});

module.exports = router;
