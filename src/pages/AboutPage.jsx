import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'
import paoDiazImg from '../assets/team/pao-diaz.png'
import matiasQuintanillaImg from '../assets/team/matias-quintanilla.png'
import rodrigoBarrazaImg from '../assets/team/rodrigo-barraza.png'
import raisaParraImg from '../assets/team/raisa-parra.png'

const FALLBACK_AVATAR = 'https://placehold.co/240x240?text=Autor'

const AUTHORS = [
  {
    name: 'Rodrigo Barraza',
    bio: 'Soy Rodrigo Barraza, Psicoanalista y Japonista. Me apasiona la literatura y el cine japonés, así como el anime y manga. De profesión soy Psicólogo y Magíster (Univ. de Chile), y trabajo en el ámbito clínico con adolescencias y subjetividades contemporáneas. Me encanta la docencia, y trato de habilitar espacios de difusión y construcción colaborativos de conocimiento.',
    avatar: rodrigoBarrazaImg,
  },
  {
    name: 'Pao Díaz',
    bio: 'Soy Pao Díaz, Psicoanalista. Me he dedicado a la clínica desde una mirada post-freudiana, mis áreas de interés son lo traumático y lo social. Me apasiona el trabajo clínico y el pensamiento crítico. Me interesa lo japonés en su veta cultural, musical y estética. También me gusta el diseño, leer sobre teoría, tomar café y estar con mi perrita. Lo mío son los perros y el psicoanálisis, en ese orden.',
    avatar: paoDiazImg,
  },
  {
    name: 'Raisa Parra',
    bio: 'Soy Raisa Parra, Psicóloga Clínica (Univ. Central), Magíster en Teoría y Clínica Psicoanalítica (Univ. Diego Portales) y Postítulo en Psicoterapia Adultos (Univ. Diego Portales). Trabajo como Docente Colaboradora en el Programa de Especialización en Psiquiatría (Univ. Santiago de Chile y Univ. Mayor). Me encanta la literatura, descubrir novelas, hacer recomendaciones de libros y viajar a través de ellos. Esto es algo que me permite pensar y sostener mi trabajo clínico.',
    avatar: raisaParraImg,
  },
  {
    name: 'Matías Quintanilla J.',
    bio: 'Soy Matías Quintanilla J. Me gusta la cerveza, el café y el vino. Me entretiene leer y escribir, mientras escucho música (repitiendo el mismo tema con una misma idea). Dentro de mis intereses de lectura, indago harto en el género seinen y recuentos de vida. Soy Psicólogo (UAH), con Postítulo en Clínica Infanto-Juvenil (U. de Chile) y actualmente hago trabajo de D.O. en INDAP.',
    avatar: matiasQuintanillaImg,
  },
]

export default function AboutPage() {
  return (
    <div className="page about-page">
      <TopBar />
      <SiteHeader />
      <main className="layout static-layout">
        <section className="static-section">
          <h1>Quiénes somos</h1>
        </section>

        <section className="authors-section" aria-label="Autores de Diván Japonés">
          <ul className="authors-list">
            {AUTHORS.map((author) => (
              <li key={author.name} className="author-card">
                <div className="author-card__avatar">
                  <img
                    src={author.avatar}
                    alt={`Foto de ${author.name}`}
                    loading="lazy"
                    onError={(e) => {
                      if (e?.target?.src !== FALLBACK_AVATAR) {
                        e.target.src = FALLBACK_AVATAR
                      }
                    }}
                  />
                </div>
                <div className="author-card__body">
                  <div className="author-card__header">
                    <h3>{author.name}</h3>
                    <span className="author-card__line" aria-hidden="true" />
                  </div>
                  <p>{author.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
