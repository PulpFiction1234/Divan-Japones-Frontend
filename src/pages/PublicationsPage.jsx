import { useMemo, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'
import { usePosts } from '../context/PostsContext'
import { fetchCategories } from '../services/api'
import slugify from '../utils/slugify'
import formatCategoryLabel from '../utils/formatCategoryLabel'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80'

function formatDate(value) {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PublicationsPage() {
  const { posts } = usePosts()
  const [activeSlug, setActiveSlug] = useState('all')
  const [dbCategories, setDbCategories] = useState([])

  const location = useLocation()

  // Cargar categorías desde la base de datos
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories()
        setDbCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [])

  // If a category query param is present (e.g. ?category=manga), set it as active
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const cat = params.get('category')
      if (cat) {
        setActiveSlug(cat)
      }
    } catch (e) {
      // ignore malformed URLSearchParams
    }
  }, [location.search])

  const categoriesWithAll = useMemo(() => {
    // Convertir categorías de la BD al formato necesario
    const dbCats = dbCategories.map(cat => ({
      name: cat.name,
      slug: cat.slug
    }))

    return [
      { name: 'Todas las publicaciones', slug: 'all' },
      ...dbCats
    ]
  }, [dbCategories])

  const publications = useMemo(() => {
    const sorted = [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

    if (activeSlug === 'all') {
      return sorted
    }

    return sorted.filter((post) => slugify(post.category) === activeSlug)
  }, [activeSlug, posts])

  return (
    <div className="page publications-page">
      <TopBar />
      <SiteHeader />
      <main className="layout publications-layout">
        <div className="publications-grid">
          <aside className="publications-sidebar" aria-label="Filtros de categoría">
            <h2>Publicaciones</h2>
            <nav>
              <ul>
                {categoriesWithAll.map((category) => (
                  <li key={category.slug}>
                    <button
                      type="button"
                      className={activeSlug === category.slug ? 'is-active' : ''}
                      aria-pressed={activeSlug === category.slug}
                      onClick={() => setActiveSlug(category.slug)}
                    >
                      <span className="publications-sidebar__label">{category.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <section className="publications-results">
            {publications.length ? (
              <ul>
                {publications.map((post) => (
                  <li key={post.id}>
                    <article>
                      <Link to={`/article/${post.id}`} className="publications-card">
                        <div className="publications-card__media">
                          <img src={post.image || FALLBACK_IMAGE} alt={post.title} loading="lazy" />
                        </div>
                        <div className="publications-card__body">
                          <span className="publications-card__category">
                            {formatCategoryLabel(post, { fallback: 'Sin categoría' })}
                          </span>
                          <h3>{post.title}</h3>
                          <footer>
                            <span>{post.author || ''}</span>
                            <span>{formatDate(post.publishedAt)}</span>
                          </footer>
                        </div>
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">
                No encontramos publicaciones para esta categoría. Comparte una nueva crónica desde el panel editorial.
              </p>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
