import { useState } from 'react';
import { canonicalPageUrl } from '../utils/seo';

export default function ShareLinks({ path, title, compact = false }) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const url = canonicalPageUrl(path);
  const shareText = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);

  const copyUrl = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else {
        const input = document.createElement('textarea');
        input.value = url;
        input.setAttribute('readonly', '');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const options = <>
    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer">Facebook</a>
    <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noreferrer">WhatsApp</a>
    <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noreferrer">X</a>
    <button type="button" onClick={copyUrl}>{copied ? 'Copied!' : 'Copy URL'}</button>
  </>;

  if (compact) return <div className="share-links share-links-compact">
    <button className="share-toggle" type="button" aria-expanded={showOptions} onClick={() => setShowOptions((open) => !open)}>{showOptions ? 'Close sharing' : 'Share product'}</button>
    {showOptions && <div className="share-link-options" aria-label={`Share ${title}`}>{options}</div>}
  </div>;

  return <nav className="share-links" aria-label={`Share ${title}`}>
    <span>SHARE</span>{options}
  </nav>;
}
