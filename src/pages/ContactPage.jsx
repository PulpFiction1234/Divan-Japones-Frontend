import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'

export default function ContactPage() {
  return (
    <div className="page contact-page">
      <TopBar />
      <SiteHeader />
      <main className="layout static-layout">
        <section className="static-section">
          <h1>Contacto</h1>
          <p>
            ¿Quieres colaborar con Diván Japonés, proponer una actividad o sumarte a nuestro círculo? Escríbenos y te
            responderemos a la brevedad.
          </p>
          <ul className="contact-list">
            <li>
              <span>Correo:</span>
              <a href="mailto:grupodivanjapones@gmail.com">grupodivanjapones@gmail.com</a>
            </li>
            <li>
              <span>Instagram:</span>
              <a href="https://www.instagram.com/grupodivanjapones/" target="_blank" rel="noreferrer">
                @grupodivanjapones
              </a>
            </li>
            <li>
              <span>Ubicación:</span>
              Providencia, Santiago de Chile (eventos presenciales y virtuales)
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
