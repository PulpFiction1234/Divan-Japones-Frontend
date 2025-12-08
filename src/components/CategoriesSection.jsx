import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'

export default function CategoriesSection() {
  const { categories } = usePosts()

  const resolvedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return []
    // Deduplicate by slug to avoid repeated chips
    const seen = new Set()
    return categories.filter((cat) => {
      const key = cat.slug || cat.name
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [categories])

  if (!resolvedCategories.length) {
    return null
  }

  return (
    <section className="categories" id="categories">
      <h2 className="section-heading">Categorías</h2>
      <div className="categories__list">
        {resolvedCategories.map((category) => (
          <Link key={category.slug || category.name} to={`/category/${category.slug}`} className="category-chip">
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
