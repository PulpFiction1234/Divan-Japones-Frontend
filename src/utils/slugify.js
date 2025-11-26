export default function slugify(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
