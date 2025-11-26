import { useEffect, useState } from 'react'
import { fetchAuthors } from '../services/api'

const FALLBACK_AVATAR = 'https://placehold.co/48x48?text=DJ'

export default function AuthorPill({ name, date }) {
  const [author, setAuthor] = useState(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const list = await fetchAuthors()
        if (!mounted) return
        const found = list.find((a) => a.name === name)
        setAuthor(found || null)
      } catch (error) {
        // ignore network errors; leave author null to use fallback
        console.error('Failed loading authors for AuthorPill', error)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [name])

  const avatar = author?.avatar || FALLBACK_AVATAR

  return (
    <span className="author-pill">
      <img src={avatar} alt={name} className="author-pill__avatar" />
      <span className="author-pill__meta">
        {date ? <span className="author-pill__by">Escrito por</span> : <span className="author-pill__by">Escrito por</span>}
        <span className="author-pill__name">{name}</span>
        {date ? <span className="author-pill__date">{date}</span> : null}
        {author?.bio ? <p className="author-pill__bio">{author.bio}</p> : null}
      </span>
    </span>
  )
}
