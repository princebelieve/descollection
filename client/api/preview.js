import previewShared from "./previewShared.cjs";

const { renderPreviewPage } = previewShared;

export default async function preview(request, response) {
  const type = request.query.type;
  const id = request.query.id;
  const apiUrl = (process.env.VITE_API_URL || process.env.API_URL || "").replace(/\/$/, "");
  if (!apiUrl || !["product", "blog"].includes(type) || !id) {
    response.status(500).type("text/plain").send("Product and article previews require VITE_API_URL at runtime.");
    return;
  }

  try {
    const apiPath = type === "blog" ? "/api/blog/" : "/api/products/";
    const recordResponse = await fetch(`${apiUrl}${apiPath}${encodeURIComponent(id)}`);
    if (!recordResponse.ok) {
      response.status(recordResponse.status === 404 ? 404 : 502).type("text/plain").send("This page is unavailable.");
      return;
    }
    const record = await recordResponse.json();
    let products = [];
    if (type === "blog" && !record.image) {
      const productsResponse = await fetch(`${apiUrl}/api/products`);
      if (productsResponse.ok) products = await productsResponse.json();
    }

    const shellResponse = await fetch("https://descollection.co.uk/index.html");
    if (!shellResponse.ok) throw new Error("Could not load the site shell");
    const template = await shellResponse.text();
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    response.status(200).send(renderPreviewPage(template, { type, id, record, products }));
  } catch (error) {
    console.error("Could not render page preview", error);
    response.status(502).type("text/plain").send("Could not load this page.");
  }
};
