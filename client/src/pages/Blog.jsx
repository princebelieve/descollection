import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { productId } from '../utils/products';
import { setPageMetadata } from '../utils/seo';
import ShareLinks from '../components/ShareLinks';

const productRecommendations = [
  [/cleanse|makeup hygiene|replace your makeup/i, ['cleanser', 'face wash', 'make-up remover'], ['cleanser', 'face wash']],
  [/sunscreen/i, ['sunscreen', 'sun protection', 'spf'], ['sunscreen', 'sun protection']],
  [/exfoliation/i, ['scrub', 'exfoliat'], ['scrub']],
  [/handwash/i, ['hand wash', 'hand soap'], ['soap']],
  [/deodorant/i, ['deodorant', 'antiperspirant'], ['deodorant']],
  [/intimate hygiene/i, ['intimate wash', 'intimate care'], ['intimate']],
  [/oral care/i, ['toothpaste', 'oral care'], ['toothpaste']],
  [/hair and scalp/i, ['shampoo', 'conditioner', 'hair oil'], ['hair care']],
  [/shaving/i, ['shaving gel', 'shaving cream'], ['body wash', 'soap']],
  [/body care|shower/i, ['body lotion', 'body wash'], ['body lotions', 'body wash']],
  [/fragrance/i, ['fragrance', 'perfume'], ['fragrances']],
  [/dry hands/i, ['hand cream'], ['hand cream', 'creams']],
  [/moistur|patch test|skincare routine|beauty labels|beauty rest|travel toiletry/i, ['moisturiser', 'moisturizer', 'face cream'], ['face cream', 'creams', 'body lotions']],
];

function recommendedProduct(post, products) {
  const rule = productRecommendations.find(([pattern]) => pattern.test(post.title));
  if (!rule) return null;
  const [, terms, categories] = rule;
  const byName = products.find((product) => terms.some((term) => product.name?.toLowerCase().includes(term)));
  return byName || products.find((product) => categories.some((category) => product.category?.toLowerCase().includes(category)));
}

export default function Blog() {
  const { products } = useStore();
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

  const recommendation = post ? recommendedProduct(post, products) : null;

  useEffect(() => {
    if (!post || !id) return;
    setPageMetadata({
      title: `${post.title} | Des-Collection Beauty Notes`,
      description: (post.excerpt || post.content).slice(0, 300),
      image: post.image || recommendation?.image || '/assets/des-collection-logo.png',
      path: `/blog/${id}`,
    });
  }, [id, post, recommendation]);

  if (id) return <main className="page text-page blog-article">
    <Link to="/blog" className="blog-back">← All articles</Link>
    {error ? <p>{error}</p> : post && <article>
      <header className="blog-article-hero"><p>BEAUTY NOTES · DES-COLLECTION</p><h1>{post.title}</h1><span>{new Date(post.createdAt).toLocaleDateString()}</span></header>
      {post.image && <img className="blog-cover" src={post.image} alt="" />}
      {post.excerpt && <p className="blog-excerpt">{post.excerpt}</p>}
      <div className="blog-body">{post.content.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      {recommendation && <aside className="blog-product-cta"><div><small>AN IDEA FOR YOUR ROUTINE</small><h2>{recommendation.name}</h2><p>Explore the product details and see if it suits your routine.</p></div><Link to={`/product/${productId(recommendation)}`}>VIEW PRODUCT</Link></aside>}
      <ShareLinks path={`/blog/${id}`} title={post.title} />
    </article>}
  </main>;

  return <main className="page blog-page">
    <header className="blog-hero"><p>FROM DES-COLLECTION</p><h1>Beauty notes</h1><span>Thoughtful care, everyday rituals, and practical guides for feeling good in your skin.</span></header>
    <p className="blog-intro">Ideas, product guides and updates from the Des-Collection team.</p>
    {error ? <p>{error}</p> : posts.length ? <div className="blog-grid">{posts.map((article) => <article className="blog-card" key={article._id}>
      <Link to={`/blog/${article._id}`}>
        <div className="blog-card-cover">{article.image ? <img src={article.image} alt="" /> : <div className="blog-image-placeholder" />}<span>{article.title}</span></div>
        <div className="blog-card-copy"><small>{new Date(article.createdAt).toLocaleDateString()}</small><h2>{article.title}</h2><p>{article.excerpt || article.content.slice(0, 150)}</p><span>READ ARTICLE →</span></div>
      </Link>
    </article>)}</div> : <div className="blog-empty"><h2>New stories are on the way</h2><p>Check back soon for beauty notes, product guides and collection updates.</p><Link to="/shop" className="shop-now">EXPLORE THE SHOP</Link></div>}
  </main>;
}
