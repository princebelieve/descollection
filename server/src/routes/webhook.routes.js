const express = require("express");
const router = express.Router();
const stripe = require("../services/stripe");
const Order = require("../models/Order");
const { sendPaidOrderNotification } = require("../services/whatsapp");

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
      deliveryAddress2: metadata.deliveryAddress2 || "",
      deliveryCity: metadata.deliveryCity || address.city || "",
      deliveryState: metadata.deliveryState || address.state || "",
      deliveryPostcode: metadata.deliveryPostcode || address.postal_code || "",
      deliveryCountry: metadata.deliveryCountry || address.country || "",
      stripeSessionId: session.id,
      amount: Number(session.amount_total || 0) / 100,
    };

    try {
      const stripeItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      orderDetails.items = JSON.stringify(stripeItems.data.map((item) => ({
        name: item.description || "Item",
        quantity: item.quantity || 1,
        amount: Number(item.amount_total || 0) / 100,
        currency: item.currency || "gbp",
      })));
    } catch (error) {
      console.error("Could not load Stripe order line items:", error.message);
    }

    let existingOrder = await Order.findOne({ stripeSessionId: session.id });
    if (!existingOrder) {
      existingOrder = await Order.create({ ...orderDetails, status: nextStatus });
      if (nextStatus === "paid") console.log("New paid order received:", session.id);
    } else if (nextStatus !== "pending" && existingOrder.status !== nextStatus) {
      existingOrder.set({ ...orderDetails, status: nextStatus });
      await existingOrder.save();
    }

    if (nextStatus === "paid" && !existingOrder.whatsappNotifiedAt) {
      try {
        const notification = await sendPaidOrderNotification(existingOrder);
        if (notification.sent) {
          existingOrder.whatsappNotifiedAt = new Date();
          existingOrder.whatsappNotificationError = "";
          await existingOrder.save();
        }
      } catch (error) {
        existingOrder.whatsappNotificationError = error.message.slice(0, 500);
        await existingOrder.save();
        console.error("WhatsApp order notification failed:", error.message);
      }
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
