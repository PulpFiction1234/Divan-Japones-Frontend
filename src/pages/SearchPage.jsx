import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi'
import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import CategoriesSection from '../components/CategoriesSection'
import SiteFooter from '../components/Footer'
import { usePosts } from '../context/PostsContext'
import formatCategoryLabel from '../utils/formatCategoryLabel'

const FALLBACK_PUBLICATION_IMAGE = 'https://images.unsplash.com/photo-1526481280695-3c46987bf1aa?auto=format&fit=crop&w=900&q=80'
const FALLBACK_ACTIVITY_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
const FALLBACK_MAGAZINE_COVER = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'

function normalize(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
}

function matchWords(haystack, words) {
  if (!words.length) return false
  const text = normalize(haystack)
  return words.every((word) => text.includes(word))
}

function formatReleaseDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
  })
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function SearchPage() {
  const { publications, activities, magazines } = usePosts()
  const location = useLocation()

  const query = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search)
      return params.get('q')?.trim() || ''
    } catch (e) {
      return ''
    }
  }, [location.search])

  const queryWords = useMemo(() => {
    if (!query) return []
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => normalize(word))
  }, [query])

  const publicationResults = useMemo(() => {
    if (!queryWords.length) return []
    return publications.filter((post) => {
      const combined = `${post.title} ${post.excerpt} ${post.content} ${post.author} ${post.category} ${post.subcategory}`
      return matchWords(combined, queryWords)
    })
  }, [publications, queryWords])

  const activityResults = useMemo(() => {
    if (!queryWords.length) return []
    return activities.filter((activity) => {
      const combined = `${activity.title} ${activity.excerpt} ${activity.content} ${activity.author} ${activity.location} ${activity.category} ${activity.subcategory}`
      return matchWords(combined, queryWords)
    })
  }, [activities, queryWords])

  const magazineResults = useMemo(() => {
    if (!queryWords.length) return []
    return magazines.filter((magazine) => {
      const combined = `${magazine.title} ${magazine.description}`
      return matchWords(combined, queryWords)
    })
  }, [magazines, queryWords])

  const totalMatches = publicationResults.length + activityResults.length + magazineResults.length

  return (
    <div className="page search-page">
      <TopBar />
      <SiteHeader />
      <main className="layout search-layout">
        <header className="search-header">
          <h1 className="section-heading">Resultados de búsqueda</h1>
          {query ? (
            <p aria-live="polite">
              {totalMatches} resultado{totalMatches === 1 ? '' : 's'} para "{query}"
            </p>
          ) : (
            <p>Escribe una palabra en el buscador para ver resultados en publicaciones, revistas y actividades.</p>
          )}
        </header>

        {queryWords.length ? (
          <div className="search-sections">
            <section className="search-section" aria-label="Publicaciones">
              <div className="search-section__header">
                <h2>Publicaciones</h2>
                <span className="search-section__count">{publicationResults.length}</span>
              </div>
              {publicationResults.length ? (
                <div className="trending search-trending">
                  <div className="trending__grid">
                    {publicationResults.map((post) => (
                      <article key={post.id} className="trending-card">
                        <Link to={`/article/${post.slug}`} className="trending-card__link">
                          <div className="trending-card__media">
                            <img
                              src={post.image || FALLBACK_PUBLICATION_IMAGE}
                              alt={post.title}
                              loading="lazy"
                            />
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
                </div>
              ) : (
                <p className="empty-state">No encontramos publicaciones para este término.</p>
              )}
            </section>

            <section className="search-section" aria-label="Actividades">
              <div className="search-section__header">
                <h2>Actividades</h2>
                <span className="search-section__count">{activityResults.length}</span>
              </div>
              {activityResults.length ? (
                <div className="activities search-activities">
                  <div className="activities__grid activities__list">
                    {activityResults.map((activity) => {
                      const eventDate = formatDate(activity.scheduledAt || activity.publishedAt)
                      const priceLabel = activity.price?.trim()
                      const locationLabel = activity.location?.trim() || 'Lugar por confirmar'

                      return (
                        <article key={activity.id} className="activity-card">
                          <Link
                            to={`/article/${activity.slug}`}
                            className="activity-card__link"
                            aria-label={`Ver detalles de ${activity.title}`}
                          >
                            <div className="activity-card__media">
                              <img src={activity.image || FALLBACK_ACTIVITY_IMAGE} alt={activity.title} loading="lazy" />
                            </div>
                            <div className="activity-card__body">
                              <span className="activity-card__category">
                                {formatCategoryLabel(activity, { includeActivityPrefix: true, fallback: 'Actividades' })}
                              </span>
                              <h3>{activity.title}</h3>
                              <div className="activity-card__meta">
                                <span className="activity-card__meta-item activity-card__meta-item--location">
                                  <FiMapPin aria-hidden="true" />
                                  {locationLabel}
                                </span>
                                <span className="activity-card__meta-item activity-card__meta-item--date">
                                  <FiCalendar aria-hidden="true" />
                                  <time dateTime={activity.scheduledAt || activity.publishedAt}>{eventDate}</time>
                                </span>
                                {priceLabel ? (
                                  <span className="activity-card__meta-item activity-card__meta-item--price">
                                    <FiDollarSign aria-hidden="true" />
                                    {priceLabel}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </Link>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="empty-state">No encontramos actividades para este término.</p>
              )}
            </section>

            <section className="search-section" aria-label="Revistas">
              <div className="search-section__header">
                <h2>Revistas</h2>
                <span className="search-section__count">{magazineResults.length}</span>
              </div>
              {magazineResults.length ? (
                <div className="magazine-gallery search-magazines">
                  {magazineResults.map((magazine) => (
                    <article key={magazine.id} className="magazine-card magazine-card--compact">
                      <Link to={`/revista/${magazine.id}`} className="magazine-card__compact-btn">
                        <div className="magazine-card__cover magazine-card__cover--compact">
                          <img
                            src={magazine.coverImage || FALLBACK_MAGAZINE_COVER}
                            alt={`Portada de ${magazine.title}`}
                            loading="lazy"
                          />
                        </div>
                        <div className="magazine-card__compact-title">{magazine.title}</div>
                        {magazine.releaseDate ? (
                          <div className="magazine-card__compact-date">
                            {formatReleaseDate(magazine.releaseDate)}
                          </div>
                        ) : null}
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No encontramos revistas para este término.</p>
              )}
            </section>
          </div>
        ) : (
          <div className="empty-state">
            <p>Usa el campo de búsqueda del encabezado para encontrar contenido en todo el sitio.</p>
            <p>Ejemplos: "haiku", "actividad", "revista".</p>
          </div>
        )}

        <CategoriesSection />
      </main>
      <SiteFooter />
    </div>
  )
}
