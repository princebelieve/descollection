const express = require("express");
const StoreSettings = require("../models/StoreSettings");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const settings = await StoreSettings.findOne({ key: "store" });
    const deliveryFee = settings?.deliveryFee ?? 0;
    res.json({ deliveryFee, shippingZones: settings?.shippingZones?.length ? settings.shippingZones : [{ name: "United Kingdom", countries: ["GB"], fee: deliveryFee }] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/", protect, adminOnly, async (req, res) => {
  const shippingZones = req.body.shippingZones;
  if (!Array.isArray(shippingZones) || shippingZones.length === 0 || shippingZones.some((zone) =>
    !zone || typeof zone.name !== "string" || !zone.name.trim() || !Array.isArray(zone.countries) ||
    !zone.countries.length || !Number.isFinite(Number(zone.fee)) || Number(zone.fee) < 0 ||
    zone.countries.some((country) => !/^[A-Z]{2}$/.test(String(country).toUpperCase()))
  )) {
    return res.status(400).json({ message: "Add valid shipping zones, countries and fees" });
  }
  const normalizedZones = shippingZones.map((zone) => ({
    name: zone.name.trim(),
    countries: [...new Set(zone.countries.map((country) => String(country).trim().toUpperCase()))],
    fee: Number(zone.fee),
  }));
  const countries = normalizedZones.flatMap((zone) => zone.countries);
  if (new Set(countries).size !== countries.length) {
    return res.status(400).json({ message: "A country can only belong to one shipping zone" });
  }
  try {
    const settings = await StoreSettings.findOneAndUpdate(
      { key: "store" },
      { $set: { shippingZones: normalizedZones, deliveryFee: normalizedZones[0]?.fee ?? 0 } },
      { new: true, upsert: true, runValidators: true },
    );
    res.json({ deliveryFee: settings.deliveryFee, shippingZones: settings.shippingZones });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
