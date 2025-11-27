import { useEffect, useRef, useState } from 'react'
import { FaTimes } from 'react-icons/fa'

const NO_PDF_ERROR =
  'Esta edición no tiene un PDF disponible en este dispositivo. Carga un enlace público desde el panel editorial.'
const GENERIC_ERROR =
  'No pudimos cargar la vista previa de la revista. Intenta abrirla en una pestaña nueva o vuelve a intentarlo más tarde.'
const LOADING_TIMEOUT_MS = 10000

export default function MagazineFlipbookModal({ magazine, onClose }) {
  const modalRef = useRef(null)
  const loadTimeoutRef = useRef(null)
  // Prefer a direct PDF source, but fall back to an external viewer URL when available
  const pdfUrl = magazine?.pdfSource || magazine?.viewerUrl || ''
  const [isLoading, setIsLoading] = useState(() => Boolean(pdfUrl))
  const [error, setError] = useState(() => (pdfUrl ? '' : NO_PDF_ERROR))

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (modalRef.current) {
      modalRef.current.focus()
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [onClose])

  useEffect(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
      loadTimeoutRef.current = null
    }

    if (!pdfUrl) {
      setIsLoading(false)
      setError(NO_PDF_ERROR)
      return () => {}
    }

    setError('')
    setIsLoading(true)

    loadTimeoutRef.current = window.setTimeout(() => {
      setIsLoading(false)
      setError(GENERIC_ERROR)
    }, LOADING_TIMEOUT_MS)

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }
    }
  }, [pdfUrl])

  useEffect(
    () => () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }
    },
    [],
  )

  const handleModalClick = (event) => {
    event.stopPropagation()
  }

  const handleFrameLoad = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
      loadTimeoutRef.current = null
    }
    setIsLoading(false)
    setError('')
  }

  const handleFrameError = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
      loadTimeoutRef.current = null
    }
    setIsLoading(false)
    setError(GENERIC_ERROR)
  }

  const handleOpenInNewTab = () => {
    if (!pdfUrl) {
      return
    }

    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      ref={modalRef}
      className="magazine-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="magazine-modal-title"
      tabIndex={-1}
      onClick={onClose}
    >
      <div className="magazine-modal__backdrop" aria-hidden="true" />
      <div className="magazine-modal__content" onClick={handleModalClick}>
        <header className="magazine-modal__header">
          <div>
            <h2 id="magazine-modal-title">{magazine.title}</h2>
            {magazine.description ? <p>{magazine.description}</p> : null}
          </div>
          <button type="button" className="magazine-modal__close" onClick={onClose} aria-label="Cerrar visor">
            <FaTimes aria-hidden="true" />
          </button>
        </header>

        <div className="magazine-modal__viewer">
          {isLoading ? <div className="magazine-modal__loader" role="status">Cargando edición…</div> : null}
          {error && !isLoading ? <p className="magazine-modal__error">{error}</p> : null}
          {!error && pdfUrl ? (
            <>
              <iframe
                key={pdfUrl}
                className="magazine-modal__iframe"
                src={pdfUrl}
                title={`Vista previa de la revista ${magazine.title}`}
                onLoad={handleFrameLoad}
                onError={handleFrameError}
                loading="lazy"
                allow="fullscreen"
              />
              <button type="button" className="magazine-modal__open-external" onClick={handleOpenInNewTab}>
                Abrir en pestaña nueva
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
