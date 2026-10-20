const SITE_URL = "https://descollection.co.uk";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;",
}[char]));

const publicImageUrl = (image) => {
  if (image && /^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}${image?.startsWith("/") ? image : `/${image || "logo.png"}`}`;
};

const recommendations = [
  [/cleanse|makeup hygiene|replace your makeup/i, ["cleanser", "face wash", "make-up remover"], ["cleanser", "face wash"]],
  [/sunscreen/i, ["sunscreen", "sun protection", "spf"], ["sunscreen", "sun protection"]],
  [/exfoliation/i, ["scrub", "exfoliat"], ["scrub"]],
  [/handwash/i, ["hand wash", "hand soap"], ["soap"]],
  [/deodorant/i, ["deodorant", "antiperspirant"], ["deodorant"]],
  [/intimate hygiene/i, ["intimate wash", "intimate care"], ["intimate"]],
  [/oral care/i, ["toothpaste", "oral care"], ["toothpaste"]],
  [/hair and scalp/i, ["shampoo", "conditioner", "hair oil"], ["hair care"]],
  [/shaving/i, ["shaving gel", "shaving cream"], ["body wash", "soap"]],
  [/body care|shower/i, ["body lotion", "body wash"], ["body lotions", "body wash"]],
  [/fragrance/i, ["fragrance", "perfume"], ["fragrances"]],
  [/dry hands/i, ["hand cream"], ["hand cream", "creams"]],
  [/moistur|patch test|skincare routine|beauty labels|beauty rest|travel toiletry/i, ["moisturiser", "moisturizer", "face cream"], ["face cream", "creams", "body lotions"]],
];

function relatedArticleProduct(post, products) {
  const rule = recommendations.find(([pattern]) => pattern.test(post.title));
  if (!rule) return null;
  const [, terms, categories] = rule;
  return products.find((product) => terms.some((term) => product.name?.toLowerCase().includes(term)))
    || products.find((product) => categories.some((category) => product.category?.toLowerCase().includes(category)));
}

function setMeta(html, attribute, key, value) {
  const escaped = escapeHtml(value);
  const matcher = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*\\/?\\s*>`, "i");
  const tag = `<meta ${attribute}="${key}" content="${escaped}" />`;
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace("</head>", `  ${tag}\n  </head>`);
}

function renderPreviewPage(template, { type, id, record, products = [] }) {
  const isArticle = type === "blog";
  const path = `/${isArticle ? "blog" : "product"}/${encodeURIComponent(id)}`;
  const title = `${record.title || record.name} | Des-Collection${isArticle ? " Beauty Notes" : ""}`;
  const description = String((isArticle ? record.excerpt || record.content : record.description) || `${record.name || record.title} from Des-Collection.`).replace(/\s+/g, " ").slice(0, 300);
  const suggested = isArticle ? relatedArticleProduct(record, products) : null;
  const image = publicImageUrl(record.image || suggested?.image || "/assets/des-collection-logo.png");
  const canonical = `${SITE_URL}${path}`;
  const typeTag = isArticle ? "article" : "product";

  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:type", typeTag);
  html = setMeta(html, "property", "og:site_name", "Des-Collection");
  html = setMeta(html, "property", "og:url", canonical);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "property", "og:image:alt", record.title || record.name);
  html = setMeta(html, "name", "twitter:card", "summary_large_image");
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = setMeta(html, "name", "twitter:image", image);
  html = html.replace(/\s*<link\s+rel="canonical"[^>]*>/i, "");
  html = html.replace("</head>", `  <link rel="canonical" href="${escapeHtml(canonical)}" />\n  </head>`);

  const cover = `<img class="blog-cover" src="${escapeHtml(image)}" alt="${escapeHtml(record.title || record.name)}" />`;
  const body = isArticle
    ? `<main class="page text-page blog-article"><article><header class="blog-article-hero"><p>BEAUTY NOTES · DES-COLLECTION</p><h1>${escapeHtml(record.title)}</h1><span>${record.createdAt ? new Date(record.createdAt).toLocaleDateString("en-GB") : ""}</span></header>${record.image || suggested?.image ? cover : ""}${record.excerpt ? `<p class="blog-excerpt">${escapeHtml(record.excerpt)}</p>` : ""}<div class="blog-body">${String(record.content || "").split(/\n\s*\n/).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div></article></main>`
    : `<main class="page product-detail"><div class="product-detail-image">${cover}</div><div><p class="kicker">${escapeHtml(record.category || "Beauty")}</p><h1>${escapeHtml(record.name)}</h1><strong>${Number(record.price) > 0 ? `£${Number(record.price).toFixed(2)}` : "Price TBC"}</strong><p>${escapeHtml(record.description || "A Des-Collection favourite.")}</p></div></main>`;
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

module.exports = { renderPreviewPage };
