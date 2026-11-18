const allowedTags = new Set([
  "a", "blockquote", "br", "code", "del", "div", "em", "h1", "h2", "h3", "h4", "h5", "h6",
  "hr", "i", "li", "ol", "p", "pre", "s", "span", "strong", "u", "ul",
]);
const voidTags = new Set(["br", "hr"]);
const dangerousContent = /<(script|style|iframe|object|embed|svg|math|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;

function fromCodePoint(value, radix) {
  const code = parseInt(value, radix);
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
}

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalizeHref(value) {
  let decoded = value;
  for (let pass = 0; pass < 3; pass += 1) {
    decoded = decoded
      .replace(/&#x([\da-f]+);?/gi, (_match, code) => fromCodePoint(code, 16))
      .replace(/&#(\d+);?/g, (_match, code) => fromCodePoint(code, 10))
      .replace(/&colon;/gi, ":")
      .replace(/&tab;/gi, "\t")
      .replace(/&newline;/gi, "\n")
      .replace(/&amp;/gi, "&");
  }
  return decoded.replace(/[\u0000-\u0020\u007f]/g, "").trim();
}

function safeHref(value) {
  const normalized = normalizeHref(value);
  if (/^(https?:\/\/|mailto:)/i.test(normalized)) return value;
  if (/^\/(?!\/)/.test(normalized) || normalized.startsWith("#")) return value;
  return "";
}

function sanitizePageHtml(input) {
  const source = String(input || "").replace(dangerousContent, "").replace(/<!--[\s\S]*?-->/g, "");
  const tokens = source.match(/<[^>]*>|[^<]+|</g) || [];
  return tokens.map((token) => {
    if (!token.startsWith("<")) return token;
    const tag = token.match(/^<\s*(\/?)\s*([a-z\d-]+)([^>]*)>$/i);
    if (!tag) return token === "<" ? "&lt;" : "";
    const closing = Boolean(tag[1]);
    const name = tag[2].toLowerCase();
    if (!allowedTags.has(name)) return "";
    if (closing) return voidTags.has(name) ? "" : `</${name}>`;

    let attributes = "";
    if (name === "a") {
      const hrefMatch = tag[3].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const titleMatch = tag[3].match(/\btitle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = hrefMatch && safeHref(hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? "");
      const title = titleMatch?.[1] ?? titleMatch?.[2] ?? titleMatch?.[3];
      if (href) attributes += ` href="${escapeAttribute(href)}"`;
      if (title) attributes += ` title="${escapeAttribute(title)}"`;
    }
    return `<${name}${attributes}>`;
  }).join("");
}

module.exports = sanitizePageHtml;
