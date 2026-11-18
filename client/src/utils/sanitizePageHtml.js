const allowedTags = new Set([
  'a', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'i', 'li', 'ol', 'p', 'pre', 's', 'span', 'strong', 'u', 'ul',
]);
const discardedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'template', 'noscript']);
const voidTags = new Set(['br', 'hr']);

function safeHref(value) {
  const href = String(value || '').trim();
  if (!href || href.startsWith('//')) return '';
  try {
    const url = new URL(href, window.location.origin);
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') return href;
  } catch { /* Invalid links are left unlinked. */ }
  return '';
}

export default function sanitizePageHtml(input) {
  const parsed = new DOMParser().parseFromString(String(input || ''), 'text/html');
  const output = document.createElement('div');

  const copyChildren = (source, target) => {
    for (const node of source.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        target.append(document.createTextNode(node.nodeValue || ''));
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const name = node.tagName.toLowerCase();
      if (discardedTags.has(name)) continue;
      if (!allowedTags.has(name)) {
        copyChildren(node, target);
        continue;
      }
      const clean = document.createElement(name);
      if (name === 'a') {
        const href = safeHref(node.getAttribute('href'));
        const title = node.getAttribute('title');
        if (href) clean.setAttribute('href', href);
        if (title) clean.setAttribute('title', title.slice(0, 200));
      }
      copyChildren(node, clean);
      target.append(clean);
    }
  };

  copyChildren(parsed.body, output);
  return output.innerHTML;
}

export { allowedTags, voidTags };
