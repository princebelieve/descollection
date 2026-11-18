import { useCallback, useEffect, useRef, useState } from 'react';
import { API } from '../data/catalog';
import sanitizePageHtml from '../utils/sanitizePageHtml';
import '../styles/staticPages.css';

const pages = [
  { slug: 'terms', title: 'Terms and conditions', path: '/terms' },
  { slug: 'privacy', title: 'Privacy notice', path: '/privacy' },
  { slug: 'returns-refunds', title: 'Returns and refunds policy', path: '/returns-refunds' },
  { slug: 'shipping', title: 'Shipping policy', path: '/shipping' },
  { slug: 'disclaimer', title: 'Disclaimer', path: '/disclaimer' },
];

async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const body = await response.text();
    if (body.trimStart().startsWith('<')) {
      throw new Error(`The page editor API returned an HTML page (HTTP ${response.status}). Check that the latest Des Collection server is deployed and that VITE_API_URL points to it.`);
    }
    throw new Error(`The page editor API returned an unexpected response (HTTP ${response.status}).`);
  }
  return response.json();
}

function EditorToolbar({ runCommand, insertLink }) {
  const controls = [
    ['bold', 'Bold', 'B'], ['italic', 'Italic', 'I'], ['underline', 'Underline', 'U'],
    ['formatBlock|<h2>', 'Heading 2', 'H2'], ['formatBlock|<h3>', 'Heading 3', 'H3'],
    ['formatBlock|<p>', 'Paragraph', 'P'], ['insertUnorderedList', 'Bulleted list', '• List'],
    ['insertOrderedList', 'Numbered list', '1. List'], ['formatBlock|<blockquote>', 'Quote', 'Quote'],
    ['removeFormat', 'Clear formatting', 'Clear'],
  ];
  return (
    <div className="static-page-toolbar" aria-label="Text formatting">
      {controls.map(([command, label, text]) => <button type="button" key={command} title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand(command)}>{text}</button>)}
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={insertLink}>Insert link</button>
    </div>
  );
}

export default function StaticPagesAdmin({ token }) {
  const [slug, setSlug] = useState(pages[0].slug);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [updatedAt, setUpdatedAt] = useState('');
  const [hasPublishedVersion, setHasPublishedVersion] = useState(false);
  const [mode, setMode] = useState('visual');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [bootstrapSlug, setBootstrapSlug] = useState('');
  const iframeRef = useRef(null);
  const editorRef = useRef(null);
  const activePage = pages.find((page) => page.slug === slug) || pages[0];
  const current = pages.find((page) => page.slug === bootstrapSlug);

  const loadPage = useCallback(async (nextSlug) => {
    setSlug(nextSlug);
    setContent('');
    setStatus('draft');
    setUpdatedAt('');
    setHasPublishedVersion(false);
    setMode('visual');
    setPreview(false);
    setError('');
    setNotice('');
    setLoading(true);
    setBootstrapSlug('');
    try {
      const response = await fetch(`${API}/api/pages/admin/${nextSlug}`, { headers: { Authorization: `Bearer ${token}` } });
      const record = await readApiResponse(response);
      if (!response.ok) throw new Error(record.message || 'Could not load this page.');
      if (record) {
        setContent(sanitizePageHtml(record.content));
        setStatus(record.status || 'draft');
        setUpdatedAt(record.updatedAt || '');
        setHasPublishedVersion(Boolean(record.publishedContent));
        setLoading(false);
      } else {
        setBootstrapSlug(nextSlug);
      }
    } catch (loadError) {
      setError(loadError.message);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadPage(pages[0].slug); }, [loadPage]);

  useEffect(() => {
    if (!loading && !preview && mode === 'visual' && editorRef.current) editorRef.current.innerHTML = content;
  }, [loading, mode, preview, slug]);

  const captureCurrentPage = () => {
    try {
      const body = iframeRef.current?.contentDocument?.querySelector('.cms-editable-body');
      if (!body) throw new Error('Could not load the current page content. Try again.');
      setContent(sanitizePageHtml(body.innerHTML));
      setStatus('draft');
      setLoading(false);
      setBootstrapSlug('');
    } catch (captureError) {
      setError(captureError.message || 'Could not read the current page content.');
      setLoading(false);
      setBootstrapSlug('');
    }
  };

  const runCommand = (command) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const [name, value] = command.split('|');
    document.execCommand(name, false, value);
    setContent(sanitizePageHtml(editorRef.current.innerHTML));
  };

  const insertLink = () => {
    const href = window.prompt('Enter a web address, email link, or site path:');
    if (!href || !editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('createLink', false, href);
    setContent(sanitizePageHtml(editorRef.current.innerHTML));
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');
    if (html) document.execCommand('insertHTML', false, sanitizePageHtml(html));
    else document.execCommand('insertText', false, text);
    if (editorRef.current) setContent(sanitizePageHtml(editorRef.current.innerHTML));
  };

  const savePage = async (nextStatus) => {
    setSaving(true);
    setError('');
    setNotice('');
    const cleanContent = sanitizePageHtml(content);
    try {
      const response = await fetch(`${API}/api/pages/admin/${slug}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cleanContent, status: nextStatus }),
      });
      const record = await readApiResponse(response);
      if (!response.ok) throw new Error(record.message || 'Could not save this page.');
      setContent(record.content);
      setStatus(record.status);
      setUpdatedAt(record.updatedAt || '');
      setHasPublishedVersion(nextStatus === 'published' || hasPublishedVersion);
      setNotice(nextStatus === 'published' ? 'Page published on the live site.' : 'Draft saved. The public page is unchanged.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="static-pages-admin">
      {bootstrapSlug && current && <iframe ref={iframeRef} className="static-page-bootstrap-frame" title={`Load existing ${current.title}`} src={current.path} onLoad={captureCurrentPage} />}
      <div className="static-pages-heading">
        <div><h2>Pages</h2><p>Edit policy and information pages using the visual editor or HTML source.</p></div>
        <a href={activePage.path} target="_blank" rel="noreferrer">View current page ↗</a>
      </div>
      <label className="static-page-select">Choose a page<select value={slug} onChange={(event) => loadPage(event.target.value)}>{pages.map((page) => <option key={page.slug} value={page.slug}>{page.title}</option>)}</select></label>
      <div className="static-page-status"><span>{status === 'published' ? 'Published' : hasPublishedVersion ? 'Draft · published version remains live' : 'Draft · public page still uses its current content'}</span>{updatedAt && <small>Last saved {new Date(updatedAt).toLocaleString()}</small>}</div>
      {loading ? <p>Loading the current page content…</p> : <>
        <div className="static-page-mode-tabs"><button type="button" className={mode === 'visual' ? 'selected' : ''} onClick={() => setMode('visual')}>Visual</button><button type="button" className={mode === 'html' ? 'selected' : ''} onClick={() => setMode('html')}>HTML</button><button type="button" className={preview ? 'selected' : ''} onClick={() => setPreview((value) => !value)}>{preview ? 'Back to editor' : 'Preview'}</button></div>
        {preview ? <div className="static-page-preview" dangerouslySetInnerHTML={{ __html: sanitizePageHtml(content) }} /> : <>
          {mode === 'visual' ? <>
            <EditorToolbar runCommand={runCommand} insertLink={insertLink} />
            <div ref={editorRef} className="static-page-visual-editor" contentEditable suppressContentEditableWarning role="textbox" aria-label={`Edit ${activePage.title}`} aria-multiline="true" onInput={(event) => setContent(sanitizePageHtml(event.currentTarget.innerHTML))} onPaste={handlePaste} />
          </> : <textarea className="static-page-html-editor" value={content} onChange={(event) => setContent(event.target.value)} aria-label={`HTML source for ${activePage.title}`} />}
        </>}
        <div className="static-page-actions"><button type="button" disabled={saving || !content.trim()} onClick={() => savePage('draft')}>{saving ? 'Saving…' : 'Save draft'}</button><button type="button" className="shop-now" disabled={saving || !content.trim()} onClick={() => savePage('published')}>{saving ? 'Publishing…' : status === 'published' ? 'Update published page' : 'Publish page'}</button></div>
      </>}
      {notice && <p className="static-page-notice" role="status">{notice}</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}
