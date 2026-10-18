const mongoose = require("mongoose");

module.exports = mongoose.model("StoreSettings", new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  deliveryFee: { type: Number, min: 0, default: 0 },
}));
