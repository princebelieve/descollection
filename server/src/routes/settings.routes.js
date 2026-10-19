const express = require("express");
const StoreSettings = require("../models/StoreSettings");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const settings = await StoreSettings.findOne({ key: "store" });
    res.json({ deliveryFee: settings?.deliveryFee ?? 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/", protect, adminOnly, async (req, res) => {
  const deliveryFee = Number(req.body.deliveryFee);
  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
    return res.status(400).json({ message: "Enter a valid delivery fee" });
  }
  try {
    const settings = await StoreSettings.findOneAndUpdate(
      { key: "store" },
      { $set: { deliveryFee } },
      { new: true, upsert: true, runValidators: true },
    );
    res.json({ deliveryFee: settings.deliveryFee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
