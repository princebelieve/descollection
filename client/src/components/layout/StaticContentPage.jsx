import { useEffect, useState } from 'react';
import { API } from '../../data/catalog';
import PolicyLinks from './PolicyLinks';
import sanitizePageHtml from '../../utils/sanitizePageHtml';

export default function StaticContentPage({ slug, children, afterContent }) {
  const [publishedContent, setPublishedContent] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(`${API}/api/pages/${slug}`)
      .then((response) => response.ok ? response.json() : null)
      .then((page) => {
        if (active && page?.status === 'published' && typeof page.content === 'string') {
          setPublishedContent(sanitizePageHtml(page.content));
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [slug]);

  return (
    <main className="page text-page legal-page">
      <div className="cms-editable-body">
        {publishedContent === null
          ? children
          : <div dangerouslySetInnerHTML={{ __html: publishedContent }} />}
      </div>
      {afterContent}
      <PolicyLinks />
    </main>
  );
}
