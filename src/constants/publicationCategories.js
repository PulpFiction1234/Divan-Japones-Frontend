import slugify from '../utils/slugify'

const CATEGORY_BLUEPRINT = [
  {
    name: 'Cine',
    subcategories: ['Ciclo de cine', 'Reseña', 'Análisis colectivo'],
  },
  {
    name: 'Literatura',
    subcategories: ['Club de lectura', 'Reseña', 'Ensayo'],
  },
  {
    name: 'Arte',
    subcategories: ['Exposición', 'Crónica', 'Entrevista'],
  },
  {
    name: 'Cultura',
    subcategories: ['Agenda', 'Crónica urbana', 'Entrevista'],
  },
  {
    name: 'Psicoanálisis',
    subcategories: ['Columna clínica', 'Seminario', 'Encuentro abierto'],
  },
  {
    name: 'Animé',
    subcategories: ['Rewatch guiado', 'Debate', 'Reseña'],
  },
  {
    name: 'Manga',
    subcategories: ['Lectura guiada', 'Recomendación', 'Ensayo visual'],
  },
]

const PUBLICATION_CATEGORIES = CATEGORY_BLUEPRINT.map(({ name, subcategories = [] }) => ({
  name,
  slug: slugify(name),
  subcategories: subcategories.map((label) => ({
    name: label,
    slug: slugify(`${name}-${label}`),
  })),
}))

export default PUBLICATION_CATEGORIES
