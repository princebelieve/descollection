const express = require("express");
const router = express.Router();
const stripe = require("../services/stripe");
const Order = require("../models/Order");

const checkoutEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
]);

router.post("/", async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (!checkoutEvents.has(event.type)) {
    return res.json({ received: true });
  }

  try {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const customer = session.customer_details || {};
    const shipping = session.shipping_details || {};
    const address = shipping.address || customer.address || {};
    const isAsyncSuccess = event.type === "checkout.session.async_payment_succeeded";
    const isAsyncFailure = event.type === "checkout.session.async_payment_failed";
    const isPaid = isAsyncSuccess || session.payment_status === "paid" || session.payment_status === "no_payment_required";
    const nextStatus = isAsyncFailure ? "failed" : isPaid ? "paid" : "pending";
    const orderDetails = {
      productId: metadata.productId || "",
      items: metadata.items || "",
      customerName: metadata.customerName || shipping.name || customer.name || "",
      customerEmail: customer.email || session.customer_email || "",
      customerPhone: metadata.customerPhone || customer.phone || "",
      deliveryAddress: metadata.deliveryAddress || [address.line1, address.line2].filter(Boolean).join(", "),
      deliveryCity: metadata.deliveryCity || address.city || "",
      deliveryPostcode: metadata.deliveryPostcode || address.postal_code || "",
      stripeSessionId: session.id,
      amount: Number(session.amount_total || 0) / 100,
    };

    const existingOrder = await Order.findOne({ stripeSessionId: session.id });
    if (!existingOrder) {
      await Order.create({ ...orderDetails, status: nextStatus });
      if (nextStatus === "paid") console.log("New paid order received:", session.id);
    } else if (nextStatus !== "pending" && existingOrder.status !== nextStatus) {
      existingOrder.set({ ...orderDetails, status: nextStatus });
      await existingOrder.save();
    }

    return res.json({ received: true });
  } catch (error) {
    // A duplicate delivery can race with another webhook request; the unique session ID keeps one order.
    if (error.code === 11000) return res.json({ received: true });
    console.error("Stripe webhook processing failed:", error.message);
    return res.status(500).json({ received: false });
  }
});

module.exports = router;
