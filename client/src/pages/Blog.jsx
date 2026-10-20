import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API } from '../data/catalog';

export default function Blog() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const url = id ? `${API}/api/blog/${id}` : `${API}/api/blog`;
    fetch(url).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load articles');
      if (active) id ? setPost(data) : setPosts(data);
    }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [id]);

  if (id) return <main className="page text-page blog-article">
    <Link to="/blog" className="blog-back">← All articles</Link>
    {error ? <p>{error}</p> : post && <article>
      <p className="kicker">FROM DES-COLLECTION</p><h1>{post.title}</h1>
      <p className="blog-date">{new Date(post.createdAt).toLocaleDateString()}</p>
      {post.image && <img className="blog-cover" src={post.image} alt="" />}
      {post.excerpt && <p className="blog-excerpt">{post.excerpt}</p>}
      <div className="blog-body">{post.content.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    </article>}
  </main>;

  return <main className="page blog-page">
    <header className="blog-hero"><p>FROM DES-COLLECTION</p><h1>Beauty notes</h1><span>Thoughtful care, everyday rituals, and practical guides for feeling good in your skin.</span></header>
    <p className="blog-intro">Ideas, product guides and updates from the Des-Collection team.</p>
    {error ? <p>{error}</p> : posts.length ? <div className="blog-grid">{posts.map((article) => <article className="blog-card" key={article._id}>
      <Link to={`/blog/${article._id}`}>
        {article.image ? <img src={article.image} alt="" /> : <div className="blog-image-placeholder">DES-COLLECTION</div>}
        <div className="blog-card-copy"><small>{new Date(article.createdAt).toLocaleDateString()}</small><h2>{article.title}</h2><p>{article.excerpt || article.content.slice(0, 150)}</p><span>READ ARTICLE →</span></div>
      </Link>
    </article>)}</div> : <div className="blog-empty"><h2>New stories are on the way</h2><p>Check back soon for beauty notes, product guides and collection updates.</p><Link to="/shop" className="shop-now">EXPLORE THE SHOP</Link></div>}
  </main>;
}
