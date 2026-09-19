import { Link, useParams } from 'react-router-dom';
import { CtaStrip, PageHead, PhotoSlot } from '../components/bits.jsx';
import { posts } from '../siteData.js';
import NotFound from './NotFound.jsx';

export function ArticleList() {
  return (
    <div className="wrap pg">
      <PageHead
        eyebrow="Articles"
        title="The blog"
        lead="Beginner guides, training notes and what actually happens when you start."
      />
      <div className="grid g-auto">
        {posts.map((p) => (
          <Link className="card hoverable r" to={`/articles/${p.id}`} key={p.id}>
            <PhotoSlot label={p.title} />
            <div className="card-b">
              <span className="tag">{p.cat}</span>
              <h3>{p.title}</h3>
              <div className="lv" style={{ margin: '2px 0 10px' }}>
                {p.date} · {p.author} · {p.read}
              </div>
              <p>{p.excerpt}</p>
              <span className="morelink" style={{ display: 'inline-block', marginTop: 12 }}>
                Read article →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ArticlePost() {
  const { id } = useParams();
  const post = posts.find((p) => p.id === id);
  if (!post) return <NotFound />;

  return (
    <div className="wrap pg" style={{ maxWidth: 760 }}>
      <Link to="/articles" className="morelink r" style={{ display: 'inline-block', marginBottom: 18 }}>
        ← All articles
      </Link>
      <span className="tag r">{post.cat}</span>
      <h1 className="h2 r" style={{ margin: '6px 0 8px' }}>
        {post.title}
      </h1>
      <div className="lv r" style={{ marginBottom: 20 }}>
        {post.date} · {post.author} · {post.read}
      </div>

      <PhotoSlot label={`${post.title} — hero image`} variant="wide" />

      <div className="r" style={{ marginTop: 22 }}>
        {post.body.map((para, i) => (
          <p key={i} style={{ marginBottom: 16, fontSize: '1.05rem' }}>
            {para}
          </p>
        ))}
      </div>

      <CtaStrip
        title="Ready to try it yourself?"
        sub="One trial class, no experience needed."
      />
    </div>
  );
}
