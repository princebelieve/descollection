//server/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyEmail,
  loginUser,
  requestPasswordReset,
  resetPassword,
  googleSignIn,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/google", googleSignIn);
router.get("/me", protect, (req, res) => res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }));

module.exports = router;
