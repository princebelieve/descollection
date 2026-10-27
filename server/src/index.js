//server/src/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Product = require("./models/Product");
const BlogPost = require("./models/BlogPost");
const { renderPreviewPage } = require("../../client/api/previewShared.cjs");

const connectDB = require("./config/db");

const paymentRoutes = require("./routes/payment.routes");
const webhookRoutes = require("./routes/webhook.routes");
const whatsappWebhookRoutes = require("./routes/whatsapp-webhook.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const authRoutes = require("./routes/auth.routes"); // ✅ ADD THIS
const measurementRoutes = require("./routes/measurementRoutes");
const settingsRoutes = require("./routes/settings.routes");
const blogRoutes = require("./routes/blog.routes");
const sitemapRoutes = require("./routes/sitemap.routes");

const app = express();

connectDB();

// Keep this ahead of express.static so the database-backed sitemap is used.
app.use("/sitemap.xml", sitemapRoutes);

// Stripe webhook (must be raw before json)
app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookRoutes,
);

// Meta WhatsApp callbacks need the original raw body for signature validation.
app.use(
  "/api/whatsapp/webhook",
  express.raw({ type: "application/json" }),
  whatsappWebhookRoutes,
);

// middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

// Serve the client build when the API server is used locally.
const builtFrontend = path.resolve(__dirname, "../../client/dist");

async function serveSharePreview(type, req, res, next) {
  if (!fs.existsSync(path.join(builtFrontend, "index.html"))) return next();
  try {
    const record = type === "blog"
      ? await BlogPost.findOne({ _id: req.params.id, published: true }).lean()
      : await Product.findById(req.params.id).lean();
    if (!record) return res.status(404).type("text/plain").send("This page is unavailable.");
    const products = type === "blog" && !record.image ? await Product.find().lean() : [];
    const template = fs.readFileSync(path.join(builtFrontend, "index.html"), "utf8");
    res.set("Content-Type", "text/html; charset=utf-8");
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return res.send(renderPreviewPage(template, { type, id: req.params.id, record, products }));
  } catch (err) {
    return next(err);
  }
}

app.get("/product/:id", (req, res, next) => serveSharePreview("product", req, res, next));
app.get("/blog/:id", (req, res, next) => serveSharePreview("blog", req, res, next));

if (fs.existsSync(builtFrontend)) app.use(express.static(builtFrontend));

// routes
app.use("/api/auth", authRoutes); // ✅ ADD THIS
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/blog", blogRoutes);

app.get("/", (req, res) => {
  if (fs.existsSync(path.join(builtFrontend, "index.html"))) {
    return res.sendFile(path.join(builtFrontend, "index.html"));
  }
  res.send("Des Collection LTD API is running. Start the React app with npm run dev.");
});

if (fs.existsSync(path.join(builtFrontend, "index.html"))) {
  app.get("*", (_req, res) => res.sendFile(path.join(builtFrontend, "index.html")));
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
