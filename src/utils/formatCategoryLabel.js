export default function formatCategoryLabel(post, options = {}) {
  const { includeActivityPrefix = false, fallback = 'Sin categoría' } = options

  if (!post) {
    return fallback
  }

  const labels = []

  if (includeActivityPrefix && post.isActivity) {
    labels.push('Actividades')
  }

  const category = post.category?.toString?.().trim()
  if (category) {
    labels.push(category)
  }

  const subcategory = post.subcategory?.toString?.().trim()
  if (subcategory) {
    labels.push(subcategory)
  }

  if (!labels.length) {
    return fallback
  }

  return labels.join(' · ')
}
