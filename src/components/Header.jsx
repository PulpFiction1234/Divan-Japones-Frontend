import { Link } from 'react-router-dom'
import { FaInstagram } from 'react-icons/fa'

const INSTAGRAM_URL = 'https://www.instagram.com/grupodivanjapones/'

export default function TopBar({ adminLink, adminLabel = 'Panel' }) {
  return (
    <div className="topbar">
      <ul className="topbar__social" aria-label="Redes sociales">
        <li>
          <a href={INSTAGRAM_URL} aria-label="Instagram" target="_blank" rel="noreferrer">
            <FaInstagram aria-hidden="true" />
            <span className="sr-only">Instagram</span>
          </a>
        </li>
      </ul>
      <form className="topbar__search" role="search" aria-label="Buscar en Divan Japonés">
        <label className="visually-hidden" htmlFor="topbar-search">
          Buscar en Divan Japonés
        </label>
        <input id="topbar-search" type="search" name="q" placeholder="Buscar" />
        <button type="submit" aria-label="Buscar">
          Buscar
        </button>
      </form>
      {adminLink ? (
        <Link className="topbar__admin" to={adminLink}>
          {adminLabel}
        </Link>
      ) : null}
    </div>
  )
}
