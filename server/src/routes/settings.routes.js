const express = require("express");
const StoreSettings = require("../models/StoreSettings");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadToR2 } = require("../config/r2");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const settings = await StoreSettings.findOne({ key: "store" });
    const deliveryFee = settings?.deliveryFee ?? 0;
    res.json({ deliveryFee, shippingZones: settings?.shippingZones?.length ? settings.shippingZones : [{ name: "United Kingdom", countries: ["GB"], fee: deliveryFee }], site: settings?.site?.toObject?.() || settings?.site || {} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/site", protect, adminOnly, upload.single("banner"), async (req, res) => {
  try {
    const current = (await StoreSettings.findOne({ key: "store" }))?.site?.toObject?.() || {};
    const body = req.body;
    const booleanFields = ["maintenance", "blockSignIn", "blockSignUp", "blockCheckout"];
    const site = { ...current };
    for (const field of booleanFields) {
      if (body[field] !== undefined) site[field] = body[field] === "true" || body[field] === true;
    }
    for (const field of ["title", "message", "launchDate"]) {
      if (body[field] !== undefined) site[field] = String(body[field]).trim().slice(0, field === "message" ? 500 : 120);
    }
    const fonts = ["manrope", "system", "arial", "trebuchet", "georgia"];
    const themes = ["classic", "soft", "editorial"];
    if (body.font !== undefined) {
      if (!fonts.includes(body.font)) return res.status(400).json({ message: "Choose one of the available site fonts." });
      site.font = body.font;
    }
    if (body.theme !== undefined) {
      if (!themes.includes(body.theme)) return res.status(400).json({ message: "Choose one of the available visual themes." });
      site.theme = body.theme;
    }
    if (body.colors !== undefined) {
      const colors = typeof body.colors === "string" ? JSON.parse(body.colors) : body.colors;
      const allowed = ["accent", "header", "footer", "body", "card", "text", "metal"];
      if (!colors || typeof colors !== "object" || Array.isArray(colors) || Object.entries(colors).some(([key, value]) => !allowed.includes(key) || !/^#[\da-f]{6}$/i.test(value))) {
        return res.status(400).json({ message: "Choose valid six-digit hex colours." });
      }
      site.colors = { ...(current.colors || {}), ...colors };
    }
    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) return res.status(400).json({ message: "Upload an image for the maintenance banner." });
      site.banner = await uploadToR2(req.file, "maintenance");
    } else if (body.removeBanner === "true") site.banner = "";
    const settings = await StoreSettings.findOneAndUpdate({ key: "store" }, { $set: { site } }, { new: true, upsert: true, runValidators: true });
    res.json(settings.site?.toObject?.() || settings.site);
  } catch (err) {
    res.status(400).json({ message: err instanceof SyntaxError ? "Invalid colour settings." : err.message || "Could not save site settings." });
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
