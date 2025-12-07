import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'
import { usePosts } from '../context/PostsContext'
import MagazineFlipbookModal from '../components/MagazineFlipbookModal'
import slugify from '../utils/slugify'
import { fetchMagazineArticles } from '../services/api'

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

export default function MagazineDetailPage() {
  const { magazines, publications } = usePosts()
  const { magazineId } = useParams()
  const sectionsRef = useRef(null)
  const [selectedMagazineId, setSelectedMagazineId] = useState(null)
  const [magazineArticles, setMagazineArticles] = useState([])
  const [loadingArticles, setLoadingArticles] = useState(false)

  const magazine = useMemo(() => {
    if (!magazineId) {
      return magazines[0] ?? null
    }

    return magazines.find((item) => item.id === magazineId) ?? null
  }, [magazines, magazineId])

  // Load magazine articles when magazine changes
  useEffect(() => {
    if (!magazine?.id) {
      setMagazineArticles([])
      return
    }

    setLoadingArticles(true)
    const controller = new AbortController()

    fetchMagazineArticles(magazine.id, { signal: controller.signal })
      .then((data) => {
        setMagazineArticles(data || [])
        setLoadingArticles(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error loading magazine articles:', err)
          setMagazineArticles([])
          setLoadingArticles(false)
        }
      })

    return () => controller.abort()
  }, [magazine?.id])

  const sectionHighlights = useMemo(() => {
    // Use magazine articles if available, otherwise fallback to general publications
    if (magazineArticles.length > 0) {
      return magazineArticles.map((article) => ({
        id: article.id,
        section: 'Artículo',
        title: article.title,
        author: article.author || 'Sin autor',
        excerpt: article.page_number || article.pageNumber ? `Página ${article.page_number || article.pageNumber}` : '',
        pdfUrl: article.pdf_url || article.pdfUrl,
      }))
    }

    if (!publications.length) {
      return []
    }

    return publications.slice(0, 12).map((post) => ({
      id: post.id,
      section: post.category || 'General',
      title: post.title,
      author: post.author,
      excerpt: post.excerpt,
      slug: slugify(post.category || 'General'),
    }))
  }, [magazineArticles, publications])

  const handleOpenMagazine = useCallback(() => {
    // Open modal when we have either a direct PDF or an external viewer URL
    if (magazine?.pdfSource || magazine?.viewerUrl) {
      setSelectedMagazineId(magazine.id)
    }
  }, [magazine])

  const handleCloseViewer = useCallback(() => {
    setSelectedMagazineId(null)
  }, [])

  const selectedMagazine = useMemo(() => {
    if (!selectedMagazineId) {
      return null
    }

    return magazines.find((item) => item.id === selectedMagazineId) ?? null
  }, [magazines, selectedMagazineId])

  const handleScrollToSections = useCallback(() => {
    sectionsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const releaseLabel = useMemo(() => {
    if (!magazine) {
      return 'Edición próximamente'
    }

    return formatReleaseDate(magazine.releaseDate)
  }, [magazine])

  return (
    <div className="page magazine-page">
      <TopBar />
      <SiteHeader />
      <main className="layout static-layout">
        {magazine ? (
          <>
            <section className="magazine-hero" aria-label="Vista previa de la revista seleccionada">
              <div
                className="magazine-hero__cover"
                style={{ '--cover-url': `url("${magazine.coverImage || FALLBACK_MAGAZINE_COVER}")` }}
              >
                <img
                  className="magazine-hero__cover-img"
                  src={magazine.coverImage || FALLBACK_MAGAZINE_COVER}
                  alt={`Portada de ${magazine.title}`}
                  loading="lazy"
                />
                <span className="magazine-hero__cover-label">Edición completa</span>
              </div>
              <div className="magazine-hero__content">
                <p className="magazine-hero__meta">
                  {releaseLabel}
                </p>
                <h1>{magazine.title}</h1>
                <p className="magazine-hero__description">
                  {magazine.description || 'Una mirada íntima a la escritura colectiva de Diván Japonés.'}
                </p>
                <div className="magazine-hero__actions">
                  <button type="button" className="magazine-hero__btn" onClick={handleOpenMagazine}>
                    Ver revista completa
                  </button>
                  <button type="button" className="magazine-hero__btn magazine-hero__btn--ghost" onClick={handleScrollToSections}>
                    Ver secciones
                  </button>
                  {magazine.pdfSource ? (
                    <a className="magazine-hero__link" href={magazine.pdfSource} target="_blank" rel="noreferrer">
                      Descargar revista
                    </a>
                  ) : null}
                </div>
              </div>
            </section>

            <section ref={sectionsRef} className="magazine-sections" aria-label="Secciones destacadas de la revista">
              <div className="magazine-sections__header">
                <p>Secciones</p>
              </div>
              <div className="magazine-sections__grid">
                {loadingArticles ? (
                  <p className="magazine-sections__empty">Cargando artículos...</p>
                ) : sectionHighlights.length ? (
                  sectionHighlights.map((section) => (
                    <article key={section.id} className="magazine-section-card">
                      <p className="magazine-section-card__label">{section.section}</p>
                      <h3>{section.title}</h3>
                      <p className="magazine-section-card__author">por {section.author}</p>
                      {section.excerpt && <p className="magazine-section-card__excerpt">{section.excerpt}</p>}
                      {section.pdfUrl ? (
                        <a 
                          href={section.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="magazine-section-card__link"
                        >
                          Descargar artículo
                        </a>
                      ) : section.slug ? (
                        <Link to={`/publicaciones?category=${section.slug}`} className="magazine-section-card__link">
                          Leer sección completa
                        </Link>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <p className="magazine-sections__empty">
                    Todavía no tenemos secciones destacadas, pero puedes explorar todas las publicaciones en la sección{' '}
                    <Link to="/publicaciones">Publicaciones</Link>.
                  </p>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className="empty-state">
            <h3>Edición no encontrada</h3>
            <p>
              Lo sentimos, no pudimos localizar esa revista. Vuelve al listado de{' '}
              <Link to="/revista">revistas</Link> y elige otra edición.
            </p>
          </div>
        )}
      </main>
      <SiteFooter />

      {selectedMagazine ? (
        <MagazineFlipbookModal magazine={selectedMagazine} onClose={handleCloseViewer} />
      ) : null}
    </div>
  )
}
