//server/src/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productId: String,
  items: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  customerPhoneDigits: String,
  deliveryAddress: String,
  deliveryAddress2: String,
  deliveryCity: String,
  deliveryState: String,
  deliveryPostcode: String,
  deliveryCountry: String,

  stripeSessionId: {
    type: String,
    unique: true,
  },

  amount: Number,
  whatsappNotifiedAt: Date,
  whatsappMessageId: String,
  whatsappNotificationError: String,
  whatsappDeliveryStatus: String,
  whatsappStatusUpdatedAt: Date,
  whatsappDeliveryError: String,
  customerWhatsappOptIn: Boolean,
  customerWhatsappOptInAt: Date,
  customerWhatsappNotifiedAt: Date,
  customerWhatsappMessageId: String,
  customerWhatsappNotificationError: String,
  customerWhatsappDeliveryStatus: String,
  customerWhatsappStatusUpdatedAt: Date,
  customerWhatsappDeliveryError: String,
  whatsappReplies: [{
    messageId: String,
    from: String,
    text: String,
    receivedAt: Date,
  }],
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
