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
    `From: Des-Collection <${process.env.GMAIL_USER}>`,
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

module.exports = { sendGmailMessage };
