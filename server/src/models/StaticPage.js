const mongoose = require("mongoose");

const staticPageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, enum: ["terms", "privacy", "returns-refunds", "shipping", "disclaimer"] },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, required: true, maxlength: 100000 },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  publishedContent: { type: String, default: "" },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("StaticPage", staticPageSchema);
