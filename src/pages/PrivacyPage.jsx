import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'

export default function PrivacyPage() {
  return (
    <div className="page privacy-page">
      <TopBar />
      <SiteHeader />
      <main className="layout static-layout">
        <section className="static-section">
          <h1>Aviso de Privacidad</h1>
          <p>
            En Diván Japonés valoramos tu privacidad. Esta página describe cómo recopilamos, usamos y
            protegemos los datos personales que nos proporcionas al interactuar con nuestro sitio web.
          </p>

          <h2>Datos que recopilamos</h2>
          <p>
            Podemos recopilar: (i) información de contacto que nos proporcionas voluntariamente (correo
            electrónico, nombre), (ii) datos relacionados con el uso del sitio (páginas visitadas,
            interacciones) y (iii) datos técnicos necesarios para la funcionalidad del sitio.
          </p>

          <h2>Uso de la información</h2>
          <p>
            Utilizamos tus datos para responder a tus consultas, enviar newsletters si te suscribes,
            mejorar la experiencia del sitio y analizar tráfico para fines estadísticos.
          </p>

          <h2>Compartir datos</h2>
          <p>
            No vendemos tus datos personales. Podemos compartir información con proveedores que nos
            ayudan a operar el sitio (servicios de hosting, envío de correo) siempre con obligaciones de
            confidencialidad.
          </p>

          <h2>Cookies y seguimiento</h2>
          <p>
            El sitio puede usar cookies y herramientas de analítica para mejorar el servicio. Puedes
            configurar tu navegador para rechazar cookies, aunque algunas funciones podrían dejar de
            funcionar correctamente.
          </p>

          <h2>Tus derechos</h2>
          <p>
            Si deseas acceder, rectificar o eliminar tus datos, o ejercer cualquier otro derecho, escríbenos
            a <a href="mailto:grupodivanjapones@gmail.com">grupodivanjapones@gmail.com</a>.
          </p>

          <p>
            Última actualización: 10 de diciembre de 2025.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
