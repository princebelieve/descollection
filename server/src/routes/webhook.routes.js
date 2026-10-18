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
      customerName: session.metadata.customerName || session.customer_details?.name || "",
      customerEmail: session.customer_email || "",
      customerPhone: session.metadata.customerPhone || "",
      deliveryAddress: session.metadata.deliveryAddress || "",
      deliveryCity: session.metadata.deliveryCity || "",
      deliveryPostcode: session.metadata.deliveryPostcode || "",
      stripeSessionId: session.id,
      amount: session.amount_total / 100,
      status: "paid",
    });
  }

  res.json({ received: true });
});

module.exports = router;
