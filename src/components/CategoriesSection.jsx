import { Link } from 'react-router-dom'
import PUBLICATION_CATEGORIES from '../constants/publicationCategories'

export default function CategoriesSection() {
  if (!PUBLICATION_CATEGORIES.length) {
    return null
  }

  return (
    <section className="categories" id="categories">
      <h2 className="section-heading">Categorías</h2>
      <div className="categories__list">
        {PUBLICATION_CATEGORIES.map((category, index) => (
          <Link key={category.slug || index} to={`/category/${category.slug}`} className="category-chip">
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
