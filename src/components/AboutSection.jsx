import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Publicaciones', to: '/publicaciones' },
  { label: 'Revista', to: '/revista' },
  { label: 'Actividades', to: '/actividades' },
  { label: 'Quienes somos', to: '/quienes-somos' },
  { label: 'Contacto', to: '/contacto' },
]

export default function SiteHeader() {
  return (
    <header className="site-header" id="inicio">
      <div className="site-header__branding">
        <span className="site-header__logo">DIVÁN JAPONÉS</span>
        <span className="site-header__descriptor">
       Espacio de encuentro reflexivo y crítico entre lo japonés y el psicoanálisis
        </span>
      </div>
      <nav className="site-header__nav" aria-label="Secciones principales">
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              {link.to ? (
                <Link to={link.to}>{link.label}</Link>
              ) : (
                <a href={link.href}>{link.label}</a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
