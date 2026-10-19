//server/src/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, min: 0, default: 0 },
  originalPrice: { type: Number, min: 0, default: null },
  image: { type: String, default: "" },
  category: { type: String, default: "Beauty" },
  description: { type: String, default: "" },
});

module.exports = mongoose.model("Product", productSchema);
