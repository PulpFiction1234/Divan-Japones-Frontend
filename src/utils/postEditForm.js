export function toDateTimeLocalValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

export function mergePostForEditing(post, fullPost) {
  if (!post && !fullPost) {
    return null
  }

  return {
    ...(post || {}),
    ...(fullPost || {}),
  }
}

export function buildPostFormState(post, fullPost) {
  const merged = mergePostForEditing(post, fullPost)
  if (!merged) {
    return null
  }

  return {
    title: merged.title || '',
    category: merged.category || '',
    subcategory: merged.subcategory || '',
    author: merged.author || '',
    excerpt: merged.excerpt || '',
    content: merged.content || '',
    publishedAt: toDateTimeLocalValue(merged.publishedAt),
    imageUrl: merged.image || merged.imageUrl || '',
    scheduledAt: toDateTimeLocalValue(merged.scheduledAt),
    price: merged.price || '',
    location: merged.location || '',
    hasActivity: Boolean(merged.isActivity || merged.scheduledAt),
  }
}
