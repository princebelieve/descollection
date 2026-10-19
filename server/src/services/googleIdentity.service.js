const crypto = require("crypto");

let cachedKeys = [];
let keysExpireAt = 0;

async function getGoogleKeys() {
  if (cachedKeys.length && Date.now() < keysExpireAt) return cachedKeys;

  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!response.ok) throw new Error("Google signing keys are unavailable.");
  const data = await response.json();
  const maxAge = Number(response.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1]) || 300;
  cachedKeys = data.keys || [];
  keysExpireAt = Date.now() + maxAge * 1000;
  return cachedKeys;
}

async function verifyGoogleCredential(token, audience) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid Google credential.");

  const [encodedHeader, encodedClaims, encodedSignature] = parts;
  const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
  const claims = JSON.parse(Buffer.from(encodedClaims, "base64url").toString("utf8"));
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported Google credential.");

  const keys = await getGoogleKeys();
  const jwk = keys.find((key) => key.kid === header.kid && key.alg === "RS256");
  if (!jwk) {
    cachedKeys = [];
    keysExpireAt = 0;
    const refreshedKeys = await getGoogleKeys();
    const refreshedJwk = refreshedKeys.find((key) => key.kid === header.kid && key.alg === "RS256");
    if (!refreshedJwk) throw new Error("Unknown Google signing key.");
    return verifyClaims(refreshedJwk, encodedHeader, encodedClaims, encodedSignature, claims, audience);
  }
  return verifyClaims(jwk, encodedHeader, encodedClaims, encodedSignature, claims, audience);
}

function verifyClaims(jwk, encodedHeader, encodedClaims, encodedSignature, claims, audience) {
  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const validSignature = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${encodedHeader}.${encodedClaims}`),
    publicKey,
    Buffer.from(encodedSignature, "base64url"),
  );
  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const validIssuer = ["accounts.google.com", "https://accounts.google.com"].includes(claims.iss);

  if (!validSignature || !validIssuer || !audiences.includes(audience) || !claims.exp || claims.exp <= now || (claims.iat && claims.iat > now + 300)) {
    throw new Error("Google credential verification failed.");
  }
  return claims;
}

module.exports = { verifyGoogleCredential };
