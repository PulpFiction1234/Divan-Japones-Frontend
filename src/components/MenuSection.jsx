import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import formatCategoryLabel from '../utils/formatCategoryLabel'

const FALLBACK_IMAGE = 'https://placehold.co/900x600?text=Divan'

export default function LatestSection() {
  const { posts } = usePosts()

  const { feature, secondary } = useMemo(() => {
    if (!posts.length) {
      return { feature: null, secondary: [] }
    }

    const ordered = [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

    return {
      feature: ordered[0],
      secondary: ordered.slice(1, 5),
    }
  }, [posts])

  if (!feature) {
    return (
      <section className="latest" id="latest">
        <h2 className="section-heading">Últimas notas</h2>
        <p className="empty-state">Aún no hay crónicas publicadas. Entra al panel editorial para compartir la primera.</p>
      </section>
    )
  }

  return (
    <section className="latest" id="latest">
      <h2 className="section-heading">Últimas notas</h2>
      <div className="latest__grid">
        <article className="feature-card">
          <Link className="feature-card__link" to={`/article/${feature.id}`}>
            <img src={feature.image || FALLBACK_IMAGE} alt={feature.title} loading="lazy" />
            <div className="feature-card__body">
              <span className="article-category">{formatCategoryLabel(feature, { fallback: 'Publicaciones' })}</span>
              <h3>{feature.title}</h3>
              <p>{feature.excerpt}</p>
              <span className="article-author">
                {feature.author} ·{' '}
                {new Date(feature.publishedAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </Link>
        </article>

        {secondary.map((article) => (
          <article key={article.id} className="latest-card">
            <Link className="latest-card__link" to={`/article/${article.id}`}>
              <img src={article.image || FALLBACK_IMAGE} alt={article.title} loading="lazy" />
              <div className="latest-card__body">
                <span className="article-category">{formatCategoryLabel(article, { fallback: 'Publicaciones' })}</span>
                <h3>{article.title}</h3>
                <span className="article-author">
                  {article.author} ·{' '}
                  {new Date(article.publishedAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
