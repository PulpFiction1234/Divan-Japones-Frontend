import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'
import { usePosts } from '../context/PostsContext'
import slugify from '../utils/slugify'

const FALLBACK_IMAGE = 'https://placehold.co/900x600?text=Divan'
const DATE_FORMATTER = new Intl.DateTimeFormat('es-MX', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(value) {
  if (!value) {
    return ''
  }

  return DATE_FORMATTER.format(new Date(value))
}

export default function CategoryPage() {
  const { slug } = useParams()
  const { publishedPosts, getCategoryBySlug } = usePosts()

  const category = getCategoryBySlug(slug)
  const posts = useMemo(() => {
    return publishedPosts.filter((post) => slugify(post.category) === slug)
  }, [publishedPosts, slug])

  return (
    <div className="page category-page">
      <TopBar />
      <SiteHeader />
      <main className="layout category-layout">
        {category ? (
          <section className="category-grid">
            <header className="category-grid__header">
              <h1>{category.name}</h1>
            </header>

            {posts.length ? (
              <div className="category-grid__items">
                {posts.map((post) => (
                  <article key={post.id} className="category-grid__card">
                    <Link to={`/article/${post.slug}`} className="category-grid__media">
                      <img src={post.image || FALLBACK_IMAGE} alt={post.title} loading="lazy" />
                    </Link>
                    <div className="category-grid__body">
                      <p className="category-grid__date">{formatDate(post.publishedAt)}</p>
                      <h2>
                        <Link to={`/article/${post.slug}`}>{post.title}</Link>
                      </h2>
                      {post.excerpt ? <p className="category-grid__excerpt">{post.excerpt}</p> : null}
                      <p className="category-grid__author">{post.author || ''}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-state">Aún no hemos publicado notas en este eje temático. Pronto compartiremos nuevas lecturas.</p>
            )}
          </section>
        ) : (
          <section className="empty-state">
            <h1>Categoría no encontrada</h1>
            <p>
              La categoría que buscas no existe. Regresa a la{' '}
              <Link to="/">portada principal</Link> para seguir explorando Diván Japonés.
            </p>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
