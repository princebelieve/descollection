const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

router.get("/", (req, res) => {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!verifyToken) return res.status(503).send("WhatsApp webhook verification is not configured");
  const isSubscription = req.query["hub.mode"] === "subscribe";
  const tokenMatches = req.query["hub.verify_token"] === verifyToken;
  const challenge = req.query["hub.challenge"];
  if (!isSubscription || !tokenMatches || typeof challenge !== "string") {
    return res.sendStatus(403);
  }
  return res.status(200).type("text/plain").send(challenge);
});

function isValidSignature(rawBody, signature, appSecret) {
  if (!Buffer.isBuffer(rawBody) || !signature || !appSecret) return false;
  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function messageText(message) {
  return message.text?.body
    || message.button?.text
    || message.interactive?.button_reply?.title
    || message.interactive?.list_reply?.title
    || `[${message.type || "WhatsApp message"}]`;
}

async function storeStatus(status) {
  if (!status.id) return;
  const order = await Order.findOne({
    $or: [{ whatsappMessageId: status.id }, { customerWhatsappMessageId: status.id }],
  });
  if (!order) return;

  const isCustomerCopy = order.customerWhatsappMessageId === status.id;
  const prefix = isCustomerCopy ? "customerWhatsapp" : "whatsapp";
  order[`${prefix}DeliveryStatus`] = status.status || "unknown";
  order[`${prefix}StatusUpdatedAt`] = status.timestamp ? new Date(Number(status.timestamp) * 1000) : new Date();
  const error = status.errors?.[0];
  order[`${prefix}DeliveryError`] = error ? [error.title, error.message, error.error_data?.details].filter(Boolean).join(": ").slice(0, 500) : "";
  await order.save();
}

async function storeInboundMessage(message) {
  const sender = phoneDigits(message.from);
  if (!sender || !message.id) return;

  let order = await Order.findOne({ customerPhoneDigits: sender }).sort({ createdAt: -1 });
  if (!order) {
    const recentOrders = await Order.find({ customerPhone: { $exists: true, $ne: "" } })
      .sort({ createdAt: -1 })
      .limit(250);
    order = recentOrders.find((candidate) => phoneDigits(candidate.customerPhone) === sender);
  }
  if (!order) {
    console.info("WhatsApp reply received from a number with no matching order:", sender);
    return;
  }
  if (order.whatsappReplies.some((reply) => reply.messageId === message.id)) return;
  order.whatsappReplies.push({
    messageId: message.id,
    from: message.from || sender,
    text: messageText(message).slice(0, 2000),
    receivedAt: message.timestamp ? new Date(Number(message.timestamp) * 1000) : new Date(),
  });
  if (order.whatsappReplies.length > 50) order.whatsappReplies.splice(0, order.whatsappReplies.length - 50);
  await order.save();
}

router.post("/", async (req, res) => {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const signature = req.get("x-hub-signature-256");
  if (!appSecret) return res.status(503).json({ message: "WhatsApp webhook signature validation is not configured" });
  if (!isValidSignature(req.body, signature, appSecret)) return res.sendStatus(401);

  let payload;
  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({ message: "Invalid WhatsApp webhook payload" });
  }

  try {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        for (const status of value.statuses || []) await storeStatus(status);
        for (const message of value.messages || []) await storeInboundMessage(message);
      }
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error("WhatsApp webhook processing failed:", error.message);
    return res.sendStatus(500);
  }
});

module.exports = router;
