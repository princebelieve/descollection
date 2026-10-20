const SITE_URL = 'https://descollection.co.uk';

function upsertMeta(attribute, key, content) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content || '');
}

export function setPageMetadata({ title, description, image, path, type = 'website' }) {
  const url = `${SITE_URL}${path}`;
  const absoluteImage = image?.startsWith('http') ? image : `${SITE_URL}${image?.startsWith('/') ? image : `/${image || 'logo.png'}`}`;
  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:type', type);
  upsertMeta('property', 'og:site_name', 'Des-Collection');
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:image', absoluteImage);
  upsertMeta('property', 'og:image:alt', title);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', absoluteImage);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

export const canonicalPageUrl = (path) => `${SITE_URL}${path}`;
