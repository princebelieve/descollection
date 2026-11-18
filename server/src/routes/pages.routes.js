const express = require("express");
const StaticPage = require("../models/StaticPage");
const { protect, adminOnly } = require("../middleware/auth");
const sanitizePageHtml = require("../utils/sanitizePageHtml");

const router = express.Router();
const pages = {
  terms: "Terms and conditions",
  privacy: "Privacy notice",
  "returns-refunds": "Returns and refunds policy",
  shipping: "Shipping policy",
  disclaimer: "Disclaimer",
};

router.get("/admin", protect, adminOnly, async (_req, res) => {
  try {
    const records = await StaticPage.find({ slug: { $in: Object.keys(pages) } }).lean();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not load pages" });
  }
});

router.get("/admin/:slug", protect, adminOnly, async (req, res) => {
  if (!pages[req.params.slug]) return res.status(404).json({ message: "Page not found" });
  try {
    const page = await StaticPage.findOne({ slug: req.params.slug }).lean();
    res.json(page || null);
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not load page" });
  }
});

router.put("/admin/:slug", protect, adminOnly, async (req, res) => {
  const { slug } = req.params;
  const { content, status } = req.body;
  if (!pages[slug]) return res.status(404).json({ message: "Page not found" });
  if (typeof content !== "string" || !content.trim() || content.length > 100000) {
    return res.status(400).json({ message: "Page content must be between 1 and 100,000 characters." });
  }
  if (!['draft', 'published'].includes(status)) return res.status(400).json({ message: "Choose draft or published status." });
  const safeContent = sanitizePageHtml(content);
  if (!safeContent.replace(/<[^>]*>/g, "").trim()) return res.status(400).json({ message: "Add some page text before saving." });
  try {
    const update = { title: pages[slug], content: safeContent, status };
    if (status === "published") {
      update.publishedContent = safeContent;
      update.publishedAt = new Date();
    }
    const page = await StaticPage.findOneAndUpdate(
      { slug },
      { $set: update },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    res.json(page);
  } catch (err) {
    res.status(400).json({ message: err.message || "Could not save page" });
  }
});

router.get("/:slug", async (req, res) => {
  if (!pages[req.params.slug]) return res.status(404).json({ message: "Page not found" });
  try {
    const page = await StaticPage.findOne({ slug: req.params.slug }).lean();
    if (!page?.publishedContent) return res.json(null);
    res.json({ slug: page.slug, title: page.title, status: "published", content: sanitizePageHtml(page.publishedContent), publishedAt: page.publishedAt });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not load page" });
  }
});

module.exports = router;
