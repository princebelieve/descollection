//server/src/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");

const paymentRoutes = require("./routes/payment.routes");
const webhookRoutes = require("./routes/webhook.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const authRoutes = require("./routes/auth.routes"); // ✅ ADD THIS
const measurementRoutes = require("./routes/measurementRoutes");
const settingsRoutes = require("./routes/settings.routes");

const app = express();

connectDB();

// Stripe webhook (must be raw before json)
app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookRoutes,
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
if (fs.existsSync(builtFrontend)) app.use(express.static(builtFrontend));

// routes
app.use("/api/auth", authRoutes); // ✅ ADD THIS
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => {
  if (fs.existsSync(path.join(builtFrontend, "index.html"))) {
    return res.sendFile(path.join(builtFrontend, "index.html"));
  }
  res.send("Des-Collection API is running. Start the React app with npm run dev.");
});

if (fs.existsSync(path.join(builtFrontend, "index.html"))) {
  app.get("*", (_req, res) => res.sendFile(path.join(builtFrontend, "index.html")));
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
