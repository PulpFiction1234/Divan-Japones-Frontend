import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import { fetchCategories } from '../services/api'

export default function CategoriesSection() {
  const { categories } = usePosts()
  const [dbCategories, setDbCategories] = useState([])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    fetchCategories({ signal: controller.signal })
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setDbCategories(data)
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error loading categories for CategoriesSection:', err)
        }
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const resolvedCategories = useMemo(() => {
    const source = dbCategories.length ? dbCategories : categories
    if (!Array.isArray(source)) return []
    // Deduplicate by slug to avoid repeated chips
    const seen = new Set()
    return source.filter((cat) => {
      const key = cat.slug || cat.name
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [categories, dbCategories])

  if (!resolvedCategories.length) {
    return null
  }

  return (
    <section className="categories" id="categories">
      <h2 className="section-heading">Categorías</h2>
      <div className="categories__list">
        {resolvedCategories.map((category) => (
          <Link
            key={category.slug || category.name}
            to={`/publicaciones?category=${category.slug}`}
            className="category-chip"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
