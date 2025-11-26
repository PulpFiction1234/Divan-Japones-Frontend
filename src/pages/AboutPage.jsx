import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'

export default function AboutPage() {
  return (
    <div className="page about-page">
      <TopBar />
      <SiteHeader />
      <main className="layout static-layout">
        <section className="static-section">
          <h1>Quiénes somos</h1>
          <p>
            Diván Japonés es un colectivo fundado en Providencia, Santiago de Chile, por amantes de la cultura japonesa
            y la práctica psicoanalítica. Creemos en la conversación interdisciplinaria como espacio de cuidado y de
            creación.
          </p>
          <p>
            Combinamos cine, literatura, manga, animación y experiencias urbanas para construir relatos compartidos.
            Documentamos nuestras sesiones, fomentamos la escritura colaborativa y abrimos canales de participación para
            nuevas voces.
          </p>
          <p>
            Si quieres sumarte a las reuniones o proponer proyectos conjuntos, escríbenos y conversemos.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
