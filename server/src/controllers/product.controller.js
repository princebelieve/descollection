// server/src/controllers/product.controller.js
const Product = require("../models/Product");
const Order = require("../models/Order");
const { uploadToR2 } = require("../config/r2");
const starterCatalog = require("../seed/desCollectionCatalog");

async function importStarterProducts(req, res) {
  try {
    const names = starterCatalog.map((product) => product.name);
    const existing = await Product.find({ name: { $in: names } }).select("name");
    const existingNames = new Set(existing.map((product) => product.name));
    const missing = starterCatalog.filter((product) => !existingNames.has(product.name));
    if (missing.length) await Product.insertMany(missing);
    const pricedStarters = starterCatalog.filter((product) => product.price > 0 && existingNames.has(product.name));
    if (pricedStarters.length) {
      await Product.bulkWrite(pricedStarters.map((product) => ({
        updateOne: {
          filter: { name: product.name },
          update: { $set: { price: product.price } },
        },
      })));
    }
    res.json({
      imported: missing.length,
      pricesUpdated: pricedStarters.length,
      products: await Product.find().sort({ _id: -1 }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getProducts(req, res) {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getBestsellers(req, res) {
  try {
    const requestedDays = Number(req.query.days) || 7;
    const days = Math.min(90, Math.max(1, requestedDays));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const orders = await Order.find({ status: "paid", createdAt: { $gte: since } }).select("items productId");
    const quantities = new Map();

    for (const order of orders) {
      let items = [];
      try {
        items = order.items ? JSON.parse(order.items) : [];
      } catch {
        items = [];
      }

      if (Array.isArray(items)) {
        for (const item of items) {
          const id = String(item.id || "");
          const quantity = Math.max(1, Math.floor(Number(item.qty) || 1));
          if (/^[a-f\d]{24}$/i.test(id)) quantities.set(id, (quantities.get(id) || 0) + quantity);
        }
      }

      const legacyId = String(order.productId || "");
      if (/^[a-f\d]{24}$/i.test(legacyId)) quantities.set(legacyId, (quantities.get(legacyId) || 0) + 1);
    }

    if (!quantities.size) return res.json({ days, products: [] });

    const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
    products.sort((a, b) => (quantities.get(String(b._id)) || 0) - (quantities.get(String(a._id)) || 0));
    res.json({
      days,
      products: products.map((product) => ({ ...product.toObject(), soldCount: quantities.get(String(product._id)) || 0 })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createProduct(req, res) {
  try {
    const { name, price, originalPrice, category, description } = req.body;

    let image = "";

    if (req.file) {
      image = await uploadToR2(req.file);
    }

    const product = await Product.create({
      name,
      price,
      originalPrice: Number(originalPrice) > Number(price) ? Number(originalPrice) : null,
      image,
      category,
      description,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = req.body.name;
    product.price = req.body.price;
    product.originalPrice = Number(req.body.originalPrice) > Number(req.body.price) ? Number(req.body.originalPrice) : null;
    product.category = req.body.category ?? product.category;
    product.description = req.body.description ?? product.description;

    if (req.file) {
      product.image = await uploadToR2(req.file);
    }

    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  importStarterProducts,
  getProducts,
  getBestsellers,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
