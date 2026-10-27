const requiredGmailSettings = [
  "GMAIL_CLIENT_ID",
  "GMAIL_CLIENT_SECRET",
  "GMAIL_REFRESH_TOKEN",
  "GMAIL_USER",
];

async function getGmailAccessToken() {
  const missing = requiredGmailSettings.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Gmail API is not configured. Missing: ${missing.join(", ")}`);
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error("Gmail API could not issue an access token.");
  }
  return data.access_token;
}

async function sendGmailMessage({ to, subject, text }) {
  const accessToken = await getGmailAccessToken();
  const message = [
    `From: Des Collection LTD <${process.env.GMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    text,
  ].join("\r\n");
  const raw = Buffer.from(message, "utf8").toString("base64url");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    throw new Error("Gmail API could not send the email.");
  }
}

function getAdminOrderRecipients() {
  return (process.env.ORDER_NOTIFICATION_EMAILS || process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

async function sendPaidOrderEmail(order) {
  const recipients = getAdminOrderRecipients();
  if (!recipients.length) throw new Error("No admin order email recipients are configured.");

  let items = [];
  try { items = JSON.parse(order.items || "[]"); } catch { /* Keep sending the order summary if legacy item data is malformed. */ }
  const address = [order.deliveryAddress, order.deliveryAddress2, order.deliveryCity, order.deliveryState, order.deliveryPostcode, order.deliveryCountry]
    .filter(Boolean)
    .join(", ");
  const orderRef = order.stripeSessionId?.slice(-10)?.toUpperCase() || String(order._id);
  const itemLines = items.length
    ? items.map((item) => `- ${item.name || item.description || item.id || "Item"} × ${item.quantity || item.qty || 1}${item.amount != null ? ` (£${Number(item.amount).toFixed(2)})` : ""}`).join("\n")
    : "Items are recorded in the Stripe order metadata.";

  await sendGmailMessage({
    to: recipients.join(", "),
    subject: `New paid order ${orderRef} — Des Collection LTD`,
    text: [
      "A new paid order was received.",
      "",
      `Order: ${orderRef}`,
      `Date: ${new Date(order.createdAt || Date.now()).toISOString()}`,
      `Customer: ${order.customerName || "Not provided"}`,
      `Email: ${order.customerEmail || "Not provided"}`,
      `Phone: ${order.customerPhone || "Not provided"}`,
      `Delivery address: ${address || "Not provided"}`,
      "",
      "Items:",
      itemLines,
      "",
      `Total: £${Number(order.amount || 0).toFixed(2)}`,
    ].join("\n"),
  });
}

module.exports = { sendGmailMessage, sendPaidOrderEmail };
