// server/src/controllers/product.controller.js
const Product = require("../models/Product");
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
    const { name, price, category, description } = req.body;

    let image = "";

    if (req.file) {
      image = await uploadToR2(req.file);
    }

    const product = await Product.create({
      name,
      price,
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
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
