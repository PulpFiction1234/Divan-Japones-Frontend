import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaInstagram } from 'react-icons/fa'

const INSTAGRAM_URL = 'https://www.instagram.com/grupodivanjapones/'

export default function TopBar({ adminLink, adminLabel = 'Panel' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const value = params.get('q') || ''
      setQuery(value)
    } catch (e) {
      setQuery('')
    }
  }, [location.search])

  const handleChange = (event) => {
    const next = event.target.value
    setQuery(next)

    const targetPath = next.trim() ? `/buscar?q=${encodeURIComponent(next)}` : '/buscar'
    // When not on search page, move the user there; while on search page, replace to avoid history spam
    navigate(targetPath, { replace: location.pathname === '/buscar' })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const term = query.trim()
    navigate(term ? `/buscar?q=${encodeURIComponent(term)}` : '/buscar')
  }

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

      <form className="topbar__search" role="search" aria-label="Buscar en Divan Japonés" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="topbar-search">
          Buscar en Divan Japonés
        </label>
        <input
          id="topbar-search"
          type="search"
          name="q"
          placeholder="Buscar"
          value={query}
          onChange={handleChange}
        />
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
