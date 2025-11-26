import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'
import { usePosts } from '../context/PostsContext'

const FALLBACK_MAGAZINE_COVER =
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'

function formatReleaseDate(value) {
  if (!value) {
    return 'Próxima publicación'
  }

  return new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
  })
}

export default function MagazinePage() {
  const { magazines } = usePosts()
  const navigate = useNavigate()
  const editions = useMemo(() => [...magazines], [magazines])

  return (
    <div className="page magazine-page">
      <TopBar />
      <SiteHeader />
      <main className="layout static-layout">
        <section className="magazine-gallery" aria-label="Ediciones disponibles">
          {editions.length ? (
            editions.map((magazine) => {
              const releaseLabel = formatReleaseDate(magazine.releaseDate)
              return (
                <article key={magazine.id} className="magazine-card magazine-card--compact">
                  <button
                    type="button"
                    className="magazine-card__compact-btn"
                    onClick={() => navigate(`/revista/${magazine.id}`)}
                  >
                    <div className="magazine-card__cover magazine-card__cover--compact">
                      <img
                        src={magazine.coverImage || FALLBACK_MAGAZINE_COVER}
                        alt={`Portada de ${magazine.title}`}
                        loading="lazy"
                      />
                    </div>
                    <div className="magazine-card__compact-title">{magazine.title}</div>
                    <div className="magazine-card__compact-date">{releaseLabel}</div>
                  </button>
                </article>
              )
            })
          ) : (
            <div className="empty-state">
              <h3>Estamos preparando la primera edición</h3>
              <p>
                Aún no hay revistas publicadas. Vuelve pronto o revisa nuestras{' '}
                <a href="/publicaciones">publicaciones recientes</a>.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
