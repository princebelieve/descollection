const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendGmailMessage } = require("../services/gmail.service");
const { verifyGoogleCredential } = require("../services/googleIdentity.service");

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const clientUrl = () => (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
const createRawToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const accountResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user._id, user.role),
});

async function registerUser(req, res) {
  let user;
  let createdNewUser = false;
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || password.length < 8) {
      return res.status(400).json({ message: "Enter your name, a valid email, and a password with at least 8 characters." });
    }
    const token = createRawToken();
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.emailVerified !== false) {
      return res.status(409).json({ message: "An account with this email already exists. Sign in or reset your password." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    if (existingUser) {
      user = existingUser;
      user.name = name;
      user.password = hashedPassword;
      user.role = adminEmails.includes(email) ? "admin" : user.role;
      user.emailVerificationTokenHash = hashToken(token);
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
    } else {
      createdNewUser = true;
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: adminEmails.includes(email) ? "admin" : "user",
        emailVerified: false,
        emailVerificationTokenHash: hashToken(token),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    const link = `${clientUrl()}/account?verify=${encodeURIComponent(token)}`;
    await sendGmailMessage({
      to: email,
      subject: "Confirm your Des Collection LTD account",
      text: `Hello ${name},\n\nConfirm your email address to activate your Des Collection LTD account:\n${link}\n\nThis link expires in 24 hours. If you did not create this account, you can ignore this email.`,
    });

    return res.status(createdNewUser ? 201 : 200).json({ message: "Check your email for a new confirmation link to activate your account." });
  } catch (err) {
    if (createdNewUser && user) await User.deleteOne({ _id: user._id }).catch(() => {});
    const status = err.code === 11000 ? 409 : 503;
    return res.status(status).json({
      message: err.code === 11000
        ? "An account with this email already exists. Sign in or reset your password."
        : "We could not send the confirmation email. Please try again later.",
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const token = String(req.query.token || "");
    if (!token) return res.status(400).json({ message: "The confirmation link is invalid or expired." });
    const user = await User.findOne({
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "The confirmation link is invalid or expired." });

    user.emailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpires = null;
    await user.save();
    return res.json({ message: "Email confirmed. You can now sign in." });
  } catch (err) {
    return res.status(500).json({ message: "We could not confirm your email. Please try again." });
  }
}

async function loginUser(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    if (adminEmails.includes(email)) {
      user.role = "admin";
      user.emailVerified = true;
      await user.save();
    } else if (!user.emailVerified) {
      return res.status(403).json({ message: "Confirm your email before signing in. Check your inbox for the confirmation link." });
    }
    return res.json(accountResponse(user));
  } catch (err) {
    return res.status(500).json({ message: "We could not sign you in. Please try again." });
  }
}

async function requestPasswordReset(req, res) {
  const genericMessage = "If an account exists for that email, a password reset link has been sent.";
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email, password: { $ne: null } });
    if (!user) return res.json({ message: genericMessage });

    const token = createRawToken();
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const link = `${clientUrl()}/account?reset=${encodeURIComponent(token)}`;
    await sendGmailMessage({
      to: user.email,
      subject: "Reset your Des Collection LTD password",
      text: `Hello ${user.name},\n\nUse this link to choose a new password for your Des Collection LTD account:\n${link}\n\nThis link expires in one hour. If you did not request a reset, you can ignore this email.`,
    });
    return res.json({ message: genericMessage });
  } catch (err) {
    return res.status(503).json({ message: "We could not send the reset email. Please try again later." });
  }
}

async function resetPassword(req, res) {
  try {
    const token = String(req.body.token || "");
    const password = String(req.body.password || "");
    if (password.length < 8) return res.status(400).json({ message: "Use a password with at least 8 characters." });
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "The reset link is invalid or expired." });

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await user.save();
    return res.json({ message: "Password updated. You can now sign in." });
  } catch (err) {
    return res.status(500).json({ message: "We could not reset your password. Please try again." });
  }
}

async function googleSignIn(req, res) {
  try {
    const credential = String(req.body.credential || "");
    if (!credential || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: "Google sign-in is not configured." });
    }

    let claims;
    try {
      claims = await verifyGoogleCredential(credential, process.env.GOOGLE_CLIENT_ID);
    } catch (err) {
      return res.status(401).json({ message: "Google could not verify this account. Please try again." });
    }
    if (!(claims.email_verified === true || claims.email_verified === "true") || !claims.sub || !claims.email) {
      return res.status(401).json({ message: "Google could not verify this account. Please try again." });
    }

    const email = claims.email.trim().toLowerCase();
    let user = await User.findOne({ $or: [{ googleId: claims.sub }, { email }] });
    if (user && user.googleId && user.googleId !== claims.sub) {
      return res.status(409).json({ message: "This email is linked to a different Google account." });
    }
    if (!user) {
      user = new User({
        name: claims.name || email.split("@")[0],
        email,
        googleId: claims.sub,
        emailVerified: true,
        role: adminEmails.includes(email) ? "admin" : "user",
      });
    } else {
      user.googleId = claims.sub;
      user.emailVerified = true;
      if (adminEmails.includes(email)) user.role = "admin";
    }
    await user.save();
    return res.json(accountResponse(user));
  } catch (err) {
    return res.status(500).json({ message: "Google sign-in failed. Please try again." });
  }
}

module.exports = { registerUser, verifyEmail, loginUser, requestPasswordReset, resetPassword, googleSignIn };
