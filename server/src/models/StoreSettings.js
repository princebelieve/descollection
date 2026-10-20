const mongoose = require("mongoose");

module.exports = mongoose.model("StoreSettings", new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  deliveryFee: { type: Number, min: 0, default: 0 },
  shippingZones: [{
    name: { type: String, trim: true },
    countries: [{ type: String, uppercase: true, trim: true }],
    fee: { type: Number, min: 0 },
  }],
}));
