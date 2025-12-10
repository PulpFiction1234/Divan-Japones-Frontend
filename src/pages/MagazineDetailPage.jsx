import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'
import { usePosts } from '../context/PostsContext'
import MagazineFlipbookModal from '../components/MagazineFlipbookModal'
import CategoriesSection from '../components/CategoriesSection'
import { fetchMagazineArticles } from '../services/api'
import slugify from '../utils/slugify'

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
  const { magazines } = usePosts()
  const { magazineId } = useParams()
  const sectionsRef = useRef(null)
  const [selectedMagazineId, setSelectedMagazineId] = useState(null)
  const [magazineArticles, setMagazineArticles] = useState([])
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [showSections, setShowSections] = useState(false)

  const magazine = useMemo(() => {
    if (!magazineId) {
      return magazines[0] ?? null
    }

    return (
      magazines.find((item) => item.id === magazineId) ||
      magazines.find((item) => item.slug === magazineId || slugify(item.title) === magazineId) ||
      null
    )
  }, [magazines, magazineId])

  // Load magazine articles when magazine changes
  useEffect(() => {
    if (!magazine?.id) {
      setMagazineArticles([])
      setShowSections(false)
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
    if (!magazineArticles.length) {
      return []
    }

    return magazineArticles.map((article) => ({
      id: article.id,
      section: 'Artículo',
      title: article.title,
      author: article.author || 'Sin autor',
      excerpt: article.excerpt || (article.page_number || article.pageNumber ? `Página ${article.page_number || article.pageNumber}` : ''),
      pdfUrl: article.pdf_url || article.pdfUrl,
    }))
  }, [magazineArticles])

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
    setShowSections((prev) => {
      const next = !prev
      if (next) {
        // allow layout to render before scrolling
        requestAnimationFrame(() => {
          sectionsRef.current?.scrollIntoView({ behavior: 'smooth' })
        })
      }
      return next
    })
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
              <div className="magazine-hero__cover">
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
                  {sectionHighlights.length ? (
                    <button
                      type="button"
                      className="magazine-hero__btn magazine-hero__btn--ghost"
                      onClick={handleScrollToSections}
                    >
                      {showSections ? 'Ocultar secciones' : 'Ver secciones'}
                    </button>
                  ) : null}
                  {magazine.pdfSource ? (
                    <a className="magazine-hero__link" href={magazine.pdfSource} target="_blank" rel="noreferrer">
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

            <CategoriesSection />
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
