const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  excerpt: { type: String, trim: true, maxlength: 320, default: "" },
  content: { type: String, required: true, trim: true },
  image: { type: String, default: "" },
  published: { type: Boolean, default: false },
}, { timestamps: true });

blogPostSchema.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model("BlogPost", blogPostSchema);
