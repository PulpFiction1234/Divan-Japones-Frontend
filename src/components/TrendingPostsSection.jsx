import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import formatCategoryLabel from '../utils/formatCategoryLabel'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526481280695-3c46987bf1aa?auto=format&fit=crop&w=900&q=80'

export default function TrendingPostsSection() {
  const { posts } = usePosts()

  const trendingPosts = useMemo(() => {
    if (!posts.length) {
      return []
    }

    return [...posts]
      .sort((a, b) => {
        if (b.viewCount === a.viewCount) {
          return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
        }
        return b.viewCount - a.viewCount
      })
      .slice(0, 4)
  }, [posts])

  if (!trendingPosts.length) {
    return null
  }

  return (
    <section className="trending" id="trending">
      <h2 className="section-heading">Tendencias</h2>
      <div className="trending__grid">
        {trendingPosts.map((post) => (
          <article key={post.id} className="trending-card">
            <Link to={`/article/${post.id}`} className="trending-card__link">
              <div className="trending-card__media">
                <img src={post.image || FALLBACK_IMAGE} alt={post.title} loading="lazy" />
              </div>
              <div className="trending-card__body">
                <span className="trending-card__category">
                  {formatCategoryLabel(post, { fallback: 'Publicaciones' })}
                </span>
                <h3>{post.title}</h3>
                {post.author ? <span className="trending-card__author">{post.author}</span> : null}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
