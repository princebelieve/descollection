//server/src/routes/order.routes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// 🔥 ONLY RETURN LATEST ORDER (NOT ALL ORDERS)
router.get("/latest", async (req, res) => {
  const order = await Order.findOne().sort({ createdAt: -1 });

  if (!order) {
    return res.json(null);
  }

  res.json(order);
});

module.exports = router;
