const mongoose = require("mongoose");

module.exports = mongoose.model("StoreSettings", new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  deliveryFee: { type: Number, min: 0, default: 0 },
  shippingZones: [{
    name: { type: String, trim: true },
    countries: [{ type: String, uppercase: true, trim: true }],
    fee: { type: Number, min: 0 },
  }],
  site: {
    maintenance: { type: Boolean, default: false },
    blockSignIn: { type: Boolean, default: false },
    blockSignUp: { type: Boolean, default: false },
    blockCheckout: { type: Boolean, default: false },
    title: { type: String, default: "We’ll be back soon" },
    message: { type: String, default: "We’re making a few improvements. Please check back shortly." },
    launchDate: { type: String, default: "" },
    banner: { type: String, default: "" },
    colors: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
}));
