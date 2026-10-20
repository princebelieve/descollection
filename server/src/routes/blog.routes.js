const express = require("express");
const BlogPost = require("../models/BlogPost");
const upload = require("../middleware/upload");
const { uploadToR2 } = require("../config/r2");
const { protect, adminOnly } = require("../middleware/auth");
const beautyArticles = require("../data/beautyArticles");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    res.json(await BlogPost.find({ published: true }).sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin", protect, adminOnly, async (_req, res) => {
  try {
    res.json(await BlogPost.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/import-beauty-guides", protect, adminOnly, async (_req, res) => {
  try {
    const existing = await BlogPost.find({}, { title: 1 }).lean();
    const titles = new Set(existing.map((post) => post.title.trim().toLowerCase()));
    const newArticles = beautyArticles.filter((article) => !titles.has(article.title.toLowerCase()));
    const posts = newArticles.length
      ? await BlogPost.insertMany(newArticles.map((article) => ({ ...article, published: true })))
      : [];
    res.status(201).json({ imported: posts.length, skipped: beautyArticles.length - posts.length, posts });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not import beauty guides" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await BlogPost.findOne({ _id: req.params.id, published: true });
    if (!post) return res.status(404).json({ message: "Article not found" });
    res.json(post);
  } catch (err) {
    res.status(404).json({ message: "Article not found" });
  }
});

router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { title, excerpt = "", content, published = "false" } = req.body;
    if (!String(title || "").trim() || !String(content || "").trim()) {
      return res.status(400).json({ message: "Title and article content are required" });
    }
    const image = req.file ? await uploadToR2(req.file, "blog") : "";
    const post = await BlogPost.create({ title, excerpt, content, image, published: published === "true" });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Blog post not found" });
    const { title, excerpt = "", content, published = "false" } = req.body;
    if (!String(title || "").trim() || !String(content || "").trim()) {
      return res.status(400).json({ message: "Title and article content are required" });
    }
    post.title = title;
    post.excerpt = excerpt;
    post.content = content;
    post.published = published === "true";
    if (req.file) post.image = await uploadToR2(req.file, "blog");
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Blog post not found" });
    res.json({ message: "Blog post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
