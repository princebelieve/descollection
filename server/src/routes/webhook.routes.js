//server/src/routes/webhook.routes.js
const express = require("express");
const router = express.Router();
const stripe = require("../services/stripe");
const Order = require("../models/Order");

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customer = session.customer_details || {};
    const shipping = session.shipping_details || {};
    const shippingAddress = shipping.address || customer.address || {};

    const existingOrder = await Order.findOne({
      stripeSessionId: session.id,
    });

    if (existingOrder) {
      return res.json({ received: true });
    }

    console.log("🚨 NEW ORDER RECEIVED");
    console.log({
      productId: session.metadata.productId || "",
      items: session.metadata.items || "",
      amount: session.amount_total / 100,
      stripeSessionId: session.id,
    });

    await Order.create({
      productId: session.metadata.productId,
      items: session.metadata.items,
      customerName: session.metadata.customerName || shipping.name || customer.name || "",
      customerEmail: customer.email || session.customer_email || "",
      customerPhone: session.metadata.customerPhone || customer.phone || "",
      deliveryAddress: session.metadata.deliveryAddress || [shippingAddress.line1, shippingAddress.line2].filter(Boolean).join(", "),
      deliveryCity: session.metadata.deliveryCity || shippingAddress.city || "",
      deliveryPostcode: session.metadata.deliveryPostcode || shippingAddress.postal_code || "",
      stripeSessionId: session.id,
      amount: session.amount_total / 100,
      status: "paid",
    });
  }

  res.json({ received: true });
});

module.exports = router;
