//server/src/routes/order.routes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/auth");
const { sendPaidOrderNotification, isWhatsAppConfigured } = require("../services/whatsapp");

router.get("/", protect, adminOnly, async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200).lean();
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Could not load orders" });
  }
});

// Keep the legacy endpoint private as well; order addresses must never be public.
router.get("/latest", protect, adminOnly, async (_req, res) => {
  try {
    const order = await Order.findOne().sort({ createdAt: -1 }).lean();
    return res.json(order || null);
  } catch (error) {
    return res.status(500).json({ message: "Could not load the latest order" });
  }
});

router.post("/:id/notify-whatsapp", protect, adminOnly, async (req, res) => {
  if (!isWhatsAppConfigured()) {
    return res.status(503).json({ message: "WhatsApp Cloud API is not configured on the server" });
  }
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "paid") return res.status(400).json({ message: "Only paid orders can be sent to WhatsApp" });
    const notification = await sendPaidOrderNotification(order);
    if (!notification.sent) return res.status(503).json({ message: "WhatsApp notification was not sent" });
    order.whatsappNotifiedAt = new Date();
    order.whatsappNotificationError = "";
    await order.save();
    return res.json({ whatsappNotifiedAt: order.whatsappNotifiedAt });
  } catch (error) {
    const order = await Order.findById(req.params.id).catch(() => null);
    if (order) {
      order.whatsappNotificationError = error.message.slice(0, 500);
      await order.save().catch(() => {});
    }
    return res.status(502).json({ message: error.message || "WhatsApp notification failed" });
  }
});

module.exports = router;
