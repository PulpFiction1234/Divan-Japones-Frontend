import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'

export default function TermsPage() {
  return (
    <div className="page terms-page">
      <TopBar />
      <SiteHeader />
      <main className="layout static-layout">
        <section className="static-section">
          <h1>Términos y Condiciones</h1>
          <p>
            Bienvenido a Diván Japonés. Al utilizar este sitio aceptas los términos y condiciones que se
            describen a continuación. Si no estás de acuerdo con alguno de ellos, por favor no utilices el
            sitio.
          </p>

          <h2>Propiedad intelectual</h2>
          <p>
            Todo el contenido publicado en este sitio (textos, imágenes, diseños) está protegido por
            derechos de autor y pertenece a sus autores o a Diván Japonés. Queda prohibida la reproducción
            total o parcial sin autorización expresa.
          </p>

          <h2>Uso del sitio</h2>
          <p>
            El usuario se compromete a usar el sitio conforme a la ley y con respeto hacia el resto de los
            usuarios. Queda prohibido el envío de contenidos ilegales, difamatorios o que infrinjan
            derechos de terceros.
          </p>

          <h2>Responsabilidad</h2>
          <p>
            Diván Japonés no se hace responsable de los daños directos o indirectos que pudieran derivarse
            del uso del sitio. Intentamos mantener la información actualizada, pero no garantizamos la
            ausencia de errores u omisiones.
          </p>

          <h2>Modificaciones</h2>
          <p>
            Nos reservamos el derecho a modificar estos términos en cualquier momento. Las modificaciones
            serán efectivas una vez publicadas en esta página.
          </p>

          <p>
            Para consultas o solicitudes relacionadas con estos términos escribe a <a href="mailto:grupodivanjapones@gmail.com">grupodivanjapones@gmail.com</a>.
          </p>

          <p>Última actualización: 10 de diciembre de 2025.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
