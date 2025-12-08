import { FaInstagram } from 'react-icons/fa'

const INSTAGRAM_URL = 'https://www.instagram.com/grupodivanjapones'

export default function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        <p className="site-footer__newsletter-text">
          Suscríbete a nuestro newsletter para recibir todas nuestras actividades y escritos.
        </p>

        <form className="site-footer__form">
          <label htmlFor="footer-newsletter" className="visually-hidden">
            Correo electrónico
          </label>
          <input id="footer-newsletter" type="email" placeholder="Escribe tu correo..." required />
          <button type="submit">Enviar</button>
        </form>

        <ul className="site-footer__social" aria-label="Redes sociales">
          <li>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <FaInstagram aria-hidden="true" />
              <span className="sr-only">Instagram</span>
            </a>
          </li>
        </ul>

        <nav className="site-footer__nav" aria-label="Enlaces secundarios">
          <a href="#contacto">Contacto</a>
          <a href="#privacidad">Aviso de Privacidad</a>
          <a href="#terminos">Términos y Condiciones</a>
        </nav>

        <p className="site-footer__copy">
          &copy; {currentYear} DIVÁN JAPONÉS. SANTIAGO DE CHILE
        </p>
      </div>
    </footer>
  )
}
