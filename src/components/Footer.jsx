import { useState } from 'react'
import { FaInstagram } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { subscribeNewsletter } from '../services/api'

const INSTAGRAM_URL = 'https://www.instagram.com/grupodivanjapones'

export default function SiteFooter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ message: '', type: '' })
  const [loading, setLoading] = useState(false)
  const currentYear = new Date().getFullYear()

  async function handleSubmit(event) {
    event.preventDefault()
    if (!email) return

    try {
      setLoading(true)
      setStatus({ message: '', type: '' })
      await subscribeNewsletter(email)
      setStatus({ message: '¡Listo! Te enviaremos nuestras novedades.', type: 'success' })
      setEmail('')
    } catch (error) {
      setStatus({ message: error.message || 'No pudimos guardar tu correo. Intenta de nuevo.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        <p className="site-footer__newsletter-text">
          Suscríbete a nuestro newsletter para recibir todas nuestras actividades y escritos.
        </p>

        <form className="site-footer__form" onSubmit={handleSubmit}>
          <label htmlFor="footer-newsletter" className="visually-hidden">
            Correo electrónico
          </label>
          <input
            id="footer-newsletter"
            type="email"
            placeholder="Escribe tu correo..."
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        {status.message ? (
          <p
            className="site-footer__status"
            style={{
              color: status.type === 'success' ? '#0f766e' : '#b91c1c',
              fontSize: '0.95rem',
              marginTop: '0.5rem'
            }}
            aria-live="polite"
          >
            {status.message}
          </p>
        ) : null}

        <ul className="site-footer__social" aria-label="Redes sociales">
          <li>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <FaInstagram aria-hidden="true" />
              <span className="sr-only">Instagram</span>
            </a>
          </li>
        </ul>

        <nav className="site-footer__nav" aria-label="Enlaces secundarios">
          <Link to="/contacto">Contacto</Link>
          <Link to="/privacidad">Aviso de Privacidad</Link>
          <Link to="/terminos-y-condiciones">Términos y Condiciones</Link>
        </nav>

        <p className="site-footer__copy">
          &copy; {currentYear} DIVÁN JAPONÉS. SANTIAGO DE CHILE
        </p>
      </div>
    </footer>
  )
}
