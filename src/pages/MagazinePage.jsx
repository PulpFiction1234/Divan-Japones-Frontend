import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'
import MagazineFlipbookModal from '../components/MagazineFlipbookModal'
import CategoriesSection from '../components/CategoriesSection'
import { fetchMagazineArticles } from '../services/api'
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
  const sectionsRef = useRef(null)
  const [selectedMagazineId, setSelectedMagazineId] = useState(null)
  const [selectedMagazineArticles, setSelectedMagazineArticles] = useState([])
  const [articlesCache, setArticlesCache] = useState({})
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [viewerMagazineId, setViewerMagazineId] = useState(null)
  const [showSections, setShowSections] = useState(false)

  const editions = useMemo(() => {
    return [...magazines].sort((a, b) => new Date(b.releaseDate || b.createdAt || 0) - new Date(a.releaseDate || a.createdAt || 0))
  }, [magazines])

  useEffect(() => {
    if (!editions.length) return
    setSelectedMagazineId((prev) => prev ?? editions[0].id)
  }, [editions])

  const selectedMagazine = useMemo(() => {
    if (!selectedMagazineId) return null
    return editions.find((m) => m.id === selectedMagazineId) || null
  }, [editions, selectedMagazineId])

  const loadArticles = useCallback(async (magazineId) => {
    if (!magazineId) return
    if (articlesCache[magazineId]) {
      setSelectedMagazineArticles(articlesCache[magazineId])
      setShowSections(false)
      return
    }
    setLoadingArticles(true)
    try {
      const data = await fetchMagazineArticles(magazineId)
      setArticlesCache((prev) => ({ ...prev, [magazineId]: data || [] }))
      setSelectedMagazineArticles(data || [])
      setShowSections(false)
    } catch (err) {
      console.error('Error loading magazine articles:', err)
      setSelectedMagazineArticles([])
      setShowSections(false)
    } finally {
      setLoadingArticles(false)
    }
  }, [articlesCache])

  useEffect(() => {
    if (!selectedMagazineId) return
    loadArticles(selectedMagazineId)
  }, [loadArticles, selectedMagazineId])

  const sectionHighlights = useMemo(() => {
    if (!selectedMagazineArticles.length) return []
    return selectedMagazineArticles.map((article) => ({
      id: article.id,
      section: 'Artículo',
      title: article.title,
      author: article.author || 'Sin autor',
      excerpt: article.excerpt || (article.page_number || article.pageNumber ? `Página ${article.page_number || article.pageNumber}` : ''),
      pdfUrl: article.pdf_url || article.pdfUrl,
    }))
  }, [selectedMagazineArticles])

  const releaseLabel = useMemo(() => formatReleaseDate(selectedMagazine?.releaseDate), [selectedMagazine?.releaseDate])

  const handleOpenMagazine = useCallback(() => {
    if (selectedMagazine?.pdfSource || selectedMagazine?.viewerUrl) {
      setViewerMagazineId(selectedMagazine.id)
    }
  }, [selectedMagazine])

  const handleCloseViewer = useCallback(() => setViewerMagazineId(null), [])

  const handleScrollToSections = useCallback(() => {
    setShowSections((prev) => {
      const next = !prev
      if (next) {
        requestAnimationFrame(() => {
          sectionsRef.current?.scrollIntoView({ behavior: 'smooth' })
        })
      }
      return next
    })
  }, [])

  const handleSelectMagazine = useCallback((id) => {
    setSelectedMagazineId(id)
    setShowSections(false)
  }, [])

  return (
    <div className="page magazine-page">
      <TopBar />
      <SiteHeader />
      <main className="layout static-layout">
        {selectedMagazine ? (
          <>
            <section className="magazine-hero" aria-label="Vista previa de la revista seleccionada">
              <div className="magazine-hero__cover">
                <img
                  className="magazine-hero__cover-img"
                  src={selectedMagazine.coverImage || FALLBACK_MAGAZINE_COVER}
                  alt={`Portada de ${selectedMagazine.title}`}
                  loading="lazy"
                />
                <span className="magazine-hero__cover-label">Edición completa</span>
              </div>
              <div className="magazine-hero__content">
                <p className="magazine-hero__meta">{releaseLabel}</p>
                <h1>{selectedMagazine.title}</h1>
                <p className="magazine-hero__description">
                  {selectedMagazine.description || 'Una mirada íntima a la escritura colectiva de Diván Japonés.'}
                </p>
                <div className="magazine-hero__actions">
                  <button type="button" className="magazine-hero__btn" onClick={handleOpenMagazine}>
                    Ver revista completa
                  </button>
                  {sectionHighlights.length ? (
                    <button type="button" className="magazine-hero__btn magazine-hero__btn--ghost" onClick={handleScrollToSections}>
                      {showSections ? 'Ocultar secciones' : 'Ver secciones'}
                    </button>
                  ) : null}
                  {selectedMagazine.pdfSource ? (
                    <a className="magazine-hero__link" href={selectedMagazine.pdfSource} target="_blank" rel="noreferrer">
                      Descargar revista
                    </a>
                  ) : null}
                </div>
              </div>
            </section>

            {sectionHighlights.length && showSections ? (
              <section ref={sectionsRef} className="magazine-sections" aria-label="Secciones destacadas de la revista">
                <div className="magazine-sections__header">
                  <p>Secciones</p>
                </div>
                <div className="magazine-sections__list" role="list">
                  {sectionHighlights.map((section, index) => (
                    <article key={section.id} className="magazine-section-row" role="listitem">
                      <span className="magazine-section-row__badge">{String(index + 1).padStart(2, '0')}</span>
                      <div className="magazine-section-row__body">
                        <p className="magazine-section-row__label">{section.section}</p>
                        <h3>{section.title}</h3>
                        <p className="magazine-section-row__author">Por {section.author}</p>
                        {section.excerpt ? (
                          <p className="magazine-section-row__excerpt">{section.excerpt}</p>
                        ) : null}
                        {section.pdfUrl ? (
                          <a 
                            href={section.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="magazine-section-row__link"
                          >
                            Descargar artículo
                          </a>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <div className="empty-state">
            <h3>Estamos preparando la primera edición</h3>
            <p>
              Aún no hay revistas publicadas. Vuelve pronto o revisa nuestras{' '}
              <a href="/publicaciones">publicaciones recientes</a>.
            </p>
          </div>
        )}

        {editions.length ? (
          <section className="magazine-gallery" aria-label="Ediciones disponibles">
            {editions.map((magazine) => {
              const releaseLabelCard = formatReleaseDate(magazine.releaseDate)
              const isActive = magazine.id === selectedMagazineId
              return (
                <article key={magazine.id} className={`magazine-card magazine-card--compact ${isActive ? 'magazine-card--active' : ''}`}>
                  <button
                    type="button"
                    className="magazine-card__compact-btn"
                    onClick={() => handleSelectMagazine(magazine.id)}
                    aria-pressed={isActive}
                  >
                    <div className="magazine-card__cover magazine-card__cover--compact">
                      <img
                        src={magazine.coverImage || FALLBACK_MAGAZINE_COVER}
                        onError={(e) => {
                          if (e?.target?.src !== FALLBACK_MAGAZINE_COVER) {
                            e.target.src = FALLBACK_MAGAZINE_COVER
                          }
                        }}
                        alt={`Portada de ${magazine.title}`}
                        loading="lazy"
                      />
                    </div>
                    <div className="magazine-card__compact-title">{magazine.title}</div>
                    <div className="magazine-card__compact-date">{releaseLabelCard}</div>
                  </button>
                </article>
              )
            })}
          </section>
        ) : null}

        <CategoriesSection />
      </main>
      <SiteFooter />

      {viewerMagazineId ? (
        <MagazineFlipbookModal
          magazine={editions.find((m) => m.id === viewerMagazineId)}
          onClose={handleCloseViewer}
        />
      ) : null}
    </div>
  )
}
