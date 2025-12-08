import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaExternalLinkAlt, FaFilePdf, FaImage, FaListUl, FaMapMarkerAlt, FaPenNib, FaTag } from 'react-icons/fa'
import { MdOutlineSchedule, MdPriceChange } from 'react-icons/md'
import { HiOutlinePhotograph } from 'react-icons/hi'
import TiptapEditor from '../components/TiptapEditor'
import TopBar from '../components/Header'
import SiteFooter from '../components/Footer'
import { usePosts } from '../context/PostsContext'
import { useAuth } from '../context/AuthContext'
import { 
  createMagazineArticle, 
  fetchMagazineArticles, 
  updateMagazineArticle,
  deleteMagazineArticle,
  fetchCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  fetchAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor
} from '../services/api'
import slugify from '../utils/slugify'

const FALLBACK_IMAGE = 'https://placehold.co/900x600?text=Divan'
const MAGAZINE_FALLBACK_COVER = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'

const initialFormState = {
  title: '',
  category: '',
  subcategory: '',
  author: '',
  excerpt: '',
  content: '',
  publishedAt: '',
  imageUrl: '',
  scheduledAt: '',
  price: '',
  location: '',
  hasActivity: false,
}

function DebugLastPayload() {
  const [payload, setPayload] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('debug_last_article_payload')
      if (raw) setPayload(JSON.parse(raw))
    } catch (e) {
      setPayload(null)
    }
  }, [])

  if (!payload) return null

  return (
    <div className="admin-debug-panel" style={{ margin: '1rem 0', padding: '0.75rem', background: '#fff8', borderRadius: 6 }}>
      <button type="button" onClick={() => setVisible((v) => !v)} style={{ marginBottom: 8 }}>
        {visible ? 'Ocultar último payload enviado' : 'Mostrar último payload enviado'}
      </button>
      {visible ? (
        <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 240, overflow: 'auto', background: '#fff', padding: '0.5rem', borderRadius: 4 }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      ) : null}
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={() => { localStorage.removeItem('debug_last_article_payload'); setPayload(null); setVisible(false) }}>
          Borrar registro de depuración
        </button>
      </div>
    </div>
  )
}

const initialMagazineFormState = {
  title: '',
  description: '',
  pdfUrl: '',
  coverUrl: '',
  releaseDate: '',
  viewerUrl: '',
  articles: [], // Array of {title, author, pdfUrl, pageNumber}
}

const initialMagazineArticleState = {
  title: '',
  author: '',
  pdfUrl: '',
  pageNumber: '',
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (event) => reject(event.target?.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

const isValidUrl = (value = '') => /^https?:\/\//i.test(value.trim())

export default function AdminPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { 
    addPost, 
    updatePost, 
    deletePost, 
    addMagazine, 
    updateMagazine, 
    deleteMagazine,
    categories, 
    magazines,
    posts,
    publications,
    activities,
    isSyncingPosts, 
    postsSyncError, 
    isSyncingMagazines, 
    magazinesSyncError 
  } = usePosts()

  // State declarations
  const [activeSection, setActiveSection] = useState('publicaciones')
  const [formState, setFormState] = useState(initialFormState)
  const [editingPostId, setEditingPostId] = useState(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Magazine state
  const [magazineForm, setMagazineForm] = useState(initialMagazineFormState)
  const [magazineArticleForm, setMagazineArticleForm] = useState(initialMagazineArticleState)
  const [editingMagazineId, setEditingMagazineId] = useState(null)
  const [editingArticleIndex, setEditingArticleIndex] = useState(null)
  const [magazineError, setMagazineError] = useState('')
  const [magazineSuccess, setMagazineSuccess] = useState('')
  const [isSavingMagazine, setIsSavingMagazine] = useState(false)

  // Categories and Authors state
  const [dbCategories, setDbCategories] = useState([])
  const [dbAuthors, setDbAuthors] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [newAuthorName, setNewAuthorName] = useState('')
  const [newAuthorImageUrl, setNewAuthorImageUrl] = useState('')
  const [editingAuthorId, setEditingAuthorId] = useState(null)
  const [categoryError, setCategoryError] = useState('')
  const [categorySuccess, setCategorySuccess] = useState('')
  const [authorError, setAuthorError] = useState('')
  const [authorSuccess, setAuthorSuccess] = useState('')

  // Load categories and authors on mount
  useEffect(() => {
    const loadCategoriesAndAuthors = async () => {
      try {
        const [cats, auths] = await Promise.all([fetchCategories(), fetchAuthors()])
        setDbCategories(cats)
        setDbAuthors(auths)
      } catch (error) {
        console.error('Error loading categories/authors:', error)
      } finally {
        setIsLoadingCategories(false)
        setIsLoadingAuthors(false)
      }
    }
    loadCategoriesAndAuthors()
  }, [])

  // Category and subcategory options
  const categoryOptions = useMemo(() => {
    return dbCategories.map(cat => cat.name).sort()
  }, [dbCategories])

  const categoryPostCounts = useMemo(() => {
    const counts = {}
    posts.forEach((post) => {
      const slug = slugify(post.category || '')
      counts[slug] = (counts[slug] || 0) + 1
    })
    return counts
  }, [posts])

  const subcategoryOptions = useMemo(() => {
    if (!formState.category) return []
    const foundCategory = categories.find(c => c.name === formState.category)
    return foundCategory?.subcategories || []
  }, [formState.category, categories])

  // Helper function to format release date
  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Publication form handlers
  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value
    setFormState(prev => ({ 
      ...prev, 
      category: newCategory,
      subcategory: '' 
    }))
  }

  const toggleActivityComponent = () => {
    setFormState(prev => ({ ...prev, hasActivity: !prev.hasActivity }))
  }

  const ensureImageValue = () => {
    return formState.imageUrl.trim() || FALLBACK_IMAGE
  }

  const resetForm = () => {
    setFormState(initialFormState)
    setEditingPostId(null)
    setError('')
    setSuccessMessage('')
  }

  const clearGeneralFields = () => {
    setFormState((prev) => ({
      ...prev,
      title: '',
      category: '',
      subcategory: '',
      author: '',
      publishedAt: '',
      imageUrl: '',
    }))
    setError('')
    setSuccessMessage('')
  }

  const handleCancel = () => {
    resetForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    if (!formState.title.trim()) {
      setError('El título es requerido.')
      setIsSubmitting(false)
      return
    }

    if (!formState.category) {
      setError('La categoría es requerida.')
      setIsSubmitting(false)
      return
    }

    if (formState.hasActivity && (!formState.scheduledAt || !formState.location)) {
      setError('Los campos de actividad (fecha y lugar) son requeridos.')
      setIsSubmitting(false)
      return
    }

    try {
      const imageUrl = ensureImageValue()
      // Normalize fields explicitly to avoid empty strings or non-ISO dates
      const normalizedScheduledAt = formState.scheduledAt ? new Date(formState.scheduledAt).toISOString() : null
      const normalizedPublishedAt = formState.publishedAt ? new Date(formState.publishedAt).toISOString() : new Date().toISOString()
      const baseData = {
        title: formState.title.trim(),
        category: formState.category,
        subcategory: formState.subcategory || null,
        author: formState.author || null,
        excerpt: formState.excerpt || '',
        content: formState.content || '',
        imageUrl,
        publishedAt: normalizedPublishedAt,
        // activity fields
        hasActivity: Boolean(formState.hasActivity),
        scheduledAt: normalizedScheduledAt,
        location: formState.location || null,
        price: formState.price || null,
      }

      if (formState.hasActivity) {
        // Ensure we send ISO dates and normalized activity fields
        baseData.scheduledAt = normalizedScheduledAt
        baseData.location = formState.location || null
        baseData.price = formState.price || null
      }

      if (editingPostId) {
        await updatePost(editingPostId, baseData)
        setSuccessMessage('Publicación actualizada correctamente.')
      } else {
        await addPost(baseData)
        setSuccessMessage('Publicación creada correctamente.')
      }

      resetForm()
    } catch (submitError) {
      console.error(submitError)
      setError('Ocurrió un error al guardar la publicación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPost = (post) => {
    setFormState({
      title: post.title,
      category: post.category,
      subcategory: post.subcategory || '',
      author: post.author || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : '',
      imageUrl: post.image || post.imageUrl || '',
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
      price: post.price || '',
      location: post.location || '',
      hasActivity: Boolean(post.scheduledAt),
    })
    setEditingPostId(post.id)
    setError('')
    setSuccessMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return

    try {
      await deletePost(postId)
      setSuccessMessage('Publicación eliminada correctamente.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (deleteError) {
      console.error(deleteError)
      setError('No se pudo eliminar la publicación.')
    }
  }

  // Magazine handlers
  const resetMagazineForm = () => {
    setMagazineForm(initialMagazineFormState)
    setMagazineArticleForm(initialMagazineArticleState)
    setEditingMagazineId(null)
    setEditingArticleIndex(null)
    setMagazineError('')
  }

  const clearMagazineInfo = () => {
    setMagazineForm((prev) => ({
      ...prev,
      title: '',
      description: '',
      pdfUrl: '',
      coverUrl: '',
      releaseDate: '',
      viewerUrl: '',
    }))
    setMagazineError('')
    setMagazineSuccess('')
  }

  const handleEditMagazine = async (magazine) => {
    try {
      const articles = await fetchMagazineArticles(magazine.id)
      
      setMagazineForm({
        title: magazine.title,
        description: magazine.description || '',
        pdfUrl: magazine.pdfSource || '',
        viewerUrl: magazine.viewerUrl || '',
        coverUrl: magazine.coverImage || '',
        releaseDate: magazine.releaseDate,
        articles: articles.map(art => ({
          id: art.id,
          title: art.title,
          author: art.author || '',
          pdfUrl: art.pdfUrl,
          pageNumber: art.pageNumber || '',
        })),
      })
      setEditingMagazineId(magazine.id)
      setMagazineSuccess('')
      setMagazineError('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error loading magazine articles:', error)
      setMagazineError('No se pudieron cargar los artículos de la revista.')
    }
  }

  const handleDeleteMagazine = async (magazineId) => {
    if (!confirm('¿Estás seguro de eliminar esta revista? Esto también eliminará todos sus artículos asociados. Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await deleteMagazine(magazineId)
      setMagazineSuccess('Revista eliminada correctamente.')
    } catch (deleteError) {
      console.error(deleteError)
      setMagazineError('No se pudo eliminar la revista.')
    }
  }

  const handleMagazineChange = (event) => {
    const { name, value } = event.target
    setMagazineForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleMagazineArticleChange = (event) => {
    const { name, value } = event.target
    setMagazineArticleForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddArticleToMagazine = () => {
    if (!magazineArticleForm.title.trim()) {
      setMagazineError('El título del artículo es requerido')
      return
    }

    if (!magazineArticleForm.pdfUrl.trim() || !isValidUrl(magazineArticleForm.pdfUrl)) {
      setMagazineError('La URL del PDF del artículo debe ser válida (https://...)')
      return
    }

    if (editingArticleIndex !== null) {
      // Modo edición: actualizar artículo existente
      setMagazineForm((prev) => ({
        ...prev,
        articles: prev.articles.map((article, index) => 
          index === editingArticleIndex 
            ? {
                ...article,
                title: magazineArticleForm.title.trim(),
                author: magazineArticleForm.author.trim() || '',
                pdfUrl: magazineArticleForm.pdfUrl.trim(),
                pageNumber: magazineArticleForm.pageNumber.trim() || '',
              }
            : article
        ),
      }))
      setEditingArticleIndex(null)
    } else {
      // Modo agregar: crear nuevo artículo
      const newArticle = {
        id: `temp-${Date.now()}`,
        title: magazineArticleForm.title.trim(),
        author: magazineArticleForm.author.trim() || '',
        pdfUrl: magazineArticleForm.pdfUrl.trim(),
        pageNumber: magazineArticleForm.pageNumber.trim() || '',
      }

      setMagazineForm((prev) => ({
        ...prev,
        articles: [...prev.articles, newArticle],
      }))
    }

    setMagazineArticleForm(initialMagazineArticleState)
    setMagazineError('')
  }

  const handleEditArticleInMagazine = (index) => {
    const article = magazineForm.articles[index]
    setMagazineArticleForm({
      title: article.title,
      author: article.author || '',
      pdfUrl: article.pdfUrl,
      pageNumber: article.pageNumber || '',
    })
    setEditingArticleIndex(index)
    setMagazineError('')
  }

  const handleCancelEditArticle = () => {
    setMagazineArticleForm(initialMagazineArticleState)
    setEditingArticleIndex(null)
    setMagazineError('')
  }

  const handleRemoveArticleFromMagazine = (index) => {
    if (editingArticleIndex === index) {
      setMagazineArticleForm(initialMagazineArticleState)
      setEditingArticleIndex(null)
    }
    setMagazineForm((prev) => ({
      ...prev,
      articles: prev.articles.filter((_, i) => i !== index),
    }))
  }

  const ensureMagazineCoverValue = () => {
    return magazineForm.coverUrl.trim() || MAGAZINE_FALLBACK_COVER
  }

  const ensurePdfValue = () => {
    return magazineForm.pdfUrl.trim() || ''
  }

  const handleMagazineSubmit = async (event) => {
    event.preventDefault()
    setIsSavingMagazine(true)
    setMagazineError('')
    setMagazineSuccess('')

    if (!magazineForm.title.trim()) {
      setMagazineError('Define un título para la revista.')
      setIsSavingMagazine(false)
      return
    }

    const hasPdfInput = Boolean(magazineForm.pdfUrl.trim())
    const viewerUrl = magazineForm.viewerUrl.trim()

    if (!hasPdfInput && !viewerUrl) {
      setMagazineError('Agrega un PDF con enlace público o pega el enlace del visor externo (Issuu, Calameo, etc.).')
      setIsSavingMagazine(false)
      return
    }

    if (magazineForm.pdfUrl && !isValidUrl(magazineForm.pdfUrl)) {
      setMagazineError('La URL del PDF debe ser válida (https://...)')
      setIsSavingMagazine(false)
      return
    }

    if (viewerUrl && !isValidUrl(viewerUrl)) {
      setMagazineError('La URL del visor debe ser válida (https://...)')
      setIsSavingMagazine(false)
      return
    }

    if (magazineForm.coverUrl && !isValidUrl(magazineForm.coverUrl)) {
      setMagazineError('La URL de la portada debe ser válida (https://...)')
      setIsSavingMagazine(false)
      return
    }

    try {
      const pdfSource = ensurePdfValue()
      const coverImage = ensureMagazineCoverValue()
      const derivedFileName = magazineForm.pdfUrl.split('/').pop() || ''

      const magazineData = {
        title: magazineForm.title.trim(),
        description: magazineForm.description.trim(),
        pdfSource,
        viewerUrl,
        coverImage,
        releaseDate: magazineForm.releaseDate,
        fileName: derivedFileName,
        isPdfPersisted: Boolean(pdfSource),
      }

      let savedMagazine
      
      if (editingMagazineId) {
        savedMagazine = await updateMagazine(editingMagazineId, magazineData)
        console.log('Updated magazine:', savedMagazine)
        
        // Actualizar artículos cuando se edita
        if (magazineForm.articles.length > 0) {
          // Obtener artículos actuales de la base de datos
          const currentArticles = await fetchMagazineArticles(editingMagazineId)
          const currentArticleIds = currentArticles.map(a => a.id)
          
          // Separar artículos existentes (con ID numérico) y nuevos (con ID temporal)
          const existingArticles = magazineForm.articles.filter(a => a.id && !String(a.id).startsWith('temp-'))
          const newArticles = magazineForm.articles.filter(a => !a.id || String(a.id).startsWith('temp-'))
          
          const formArticleIds = existingArticles.map(a => a.id)
          
          // Eliminar artículos que ya no están en el formulario
          for (const articleId of currentArticleIds) {
            if (!formArticleIds.includes(articleId)) {
              await deleteMagazineArticle(editingMagazineId, articleId)
              console.log('Deleted article:', articleId)
            }
          }
          
          // Actualizar artículos existentes que fueron modificados
          for (const article of existingArticles) {
            const payload = {
              title: article.title,
              author: article.author || null,
              pdfUrl: article.pdfUrl,
              pageNumber: article.pageNumber || null,
            }
            const updatedArticle = await updateMagazineArticle(editingMagazineId, article.id, payload)
            console.log('Updated article:', updatedArticle)
          }
          
          // Crear nuevos artículos (los que tienen ID temporal o no tienen ID)
          for (const article of newArticles) {
            const savedArticle = await createMagazineArticle(editingMagazineId, {
              title: article.title,
              author: article.author || null,
              pdfUrl: article.pdfUrl,
              pageNumber: article.pageNumber || null,
            })
            console.log('Created new article:', savedArticle)
          }
        } else {
          // Si no hay artículos en el formulario, eliminar todos los existentes
          const currentArticles = await fetchMagazineArticles(editingMagazineId)
          for (const article of currentArticles) {
            await deleteMagazineArticle(editingMagazineId, article.id)
            console.log('Deleted article:', article.id)
          }
        }
      } else {
        savedMagazine = await addMagazine(magazineData)
        console.log('Saved magazine:', savedMagazine)
        
        // Save magazine articles if any (only when creating new)
        if (magazineForm.articles.length > 0 && savedMagazine?.id) {
          console.log(`Saving ${magazineForm.articles.length} articles for magazine ${savedMagazine.id}`)
          for (const article of magazineForm.articles) {
            const savedArticle = await createMagazineArticle(savedMagazine.id, {
              title: article.title,
              author: article.author || null,
              pdfUrl: article.pdfUrl,
              pageNumber: article.pageNumber || null,
            })
            console.log('Saved article:', savedArticle)
          }
        }
      }

      resetMagazineForm()
      const hasExternalViewer = Boolean(viewerUrl)

      if (editingMagazineId) {
        setMagazineSuccess('Revista actualizada correctamente.')
      } else if (!pdfSource && hasExternalViewer) {
        setMagazineSuccess(
          `Revista publicada con ${magazineForm.articles.length} artículo(s). El enlace abrirá el visor externo configurado.`
        )
      } else {
        setMagazineSuccess(
          `Revista publicada correctamente con ${magazineForm.articles.length} artículo(s). La edición se mostrará en el visor integrado.`
        )
      }
    } catch (submitError) {
      console.error(submitError)
      setMagazineError('Ocurrió un problema al guardar la revista.')
    } finally {
      setIsSavingMagazine(false)
    }
  }

  const handleMagazineCancel = () => {
    resetMagazineForm()
    setMagazineSuccess('')
  }

  // Funciones para categorías
  const handleAddCategory = async (e) => {
    e.preventDefault()
    setCategoryError('')
    setCategorySuccess('')

    if (!newCategoryName.trim()) {
      setCategoryError('El nombre de la categoría no puede estar vacío')
      return
    }

    try {
      const slug = slugify(newCategoryName.trim())
      if (editingCategoryId) {
        const updated = await updateCategory(editingCategoryId, { name: newCategoryName.trim(), slug })
        setDbCategories(dbCategories.map((c) => (c.id === editingCategoryId ? updated : c)))
        setCategorySuccess(`Categoría "${newCategoryName}" actualizada`)
        setEditingCategoryId(null)
      } else {
        const newCategory = await createCategory({ name: newCategoryName.trim(), slug })
        setDbCategories([...dbCategories, newCategory])
        setCategorySuccess(`Categoría "${newCategoryName}" agregada exitosamente`)
      }

      setNewCategoryName('')
      setTimeout(() => setCategorySuccess(''), 3000)
    } catch (error) {
      setCategoryError(error.message || 'Error al agregar la categoría')
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id)
    setNewCategoryName(category.name || '')
    setCategoryError('')
    setCategorySuccess('')
  }

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null)
    setNewCategoryName('')
    setCategoryError('')
    setCategorySuccess('')
  }

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"?`)) {
      try {
        await deleteCategory(categoryId)
        setDbCategories(dbCategories.filter(c => c.id !== categoryId))
        setCategorySuccess(`Categoría "${categoryName}" eliminada`)
        setTimeout(() => setCategorySuccess(''), 3000)
      } catch (error) {
        setCategoryError(error.message || 'Error al eliminar la categoría')
      }
    }
  }

  // Funciones para autores
  const handleAddAuthor = async (e) => {
    e.preventDefault()
    setAuthorError('')
    setAuthorSuccess('')

    if (!newAuthorName.trim()) {
      setAuthorError('El nombre del autor no puede estar vacío')
      return
    }

    try {
      const payload = { name: newAuthorName.trim() }
      if (newAuthorImageUrl && isValidUrl(newAuthorImageUrl)) {
        payload.avatar = newAuthorImageUrl.trim()
      }

      if (editingAuthorId) {
        const updated = await updateAuthor(editingAuthorId, payload)
        setDbAuthors(dbAuthors.map((a) => (a.id === editingAuthorId ? updated : a)))
        setAuthorSuccess(`Autor "${newAuthorName}" actualizado`)
      } else {
        const newAuthor = await createAuthor(payload)
        setDbAuthors([...dbAuthors, newAuthor])
        setAuthorSuccess(`Autor "${newAuthorName}" agregado exitosamente`)
      }

      setNewAuthorName('')
      setNewAuthorImageUrl('')
      setEditingAuthorId(null)
      setTimeout(() => setAuthorSuccess(''), 3000)
    } catch (error) {
      setAuthorError(error.message || 'Error al guardar el autor')
    }
  }

  const handleAuthorImageUrlChange = (e) => {
    setNewAuthorImageUrl(e.target.value)
  }

  const handleDeleteAuthor = async (authorId, authorName) => {
    if (window.confirm(`¿Estás seguro de eliminar al autor "${authorName}"?`)) {
      try {
        await deleteAuthor(authorId)
        setDbAuthors(dbAuthors.filter(a => a.id !== authorId))
        setAuthorSuccess(`Autor "${authorName}" eliminado`)
        setTimeout(() => setAuthorSuccess(''), 3000)
      } catch (error) {
        setAuthorError(error.message || 'Error al eliminar el autor')
      }
    }
  }

  const handleEditAuthor = (author) => {
    setEditingAuthorId(author.id)
    setNewAuthorName(author.name || '')
    setNewAuthorImageUrl(author.avatar || '')
    setAuthorError('')
    setAuthorSuccess('')
  }

  const handleCancelEditAuthor = () => {
    setEditingAuthorId(null)
    setNewAuthorName('')
    setNewAuthorImageUrl('')
    setAuthorError('')
    setAuthorSuccess('')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-page">
      <TopBar />
      <main className="admin-page__main">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button 
              className={`admin-nav__item ${activeSection === 'publicaciones' ? 'active' : ''}`}
              onClick={() => setActiveSection('publicaciones')}
            >
              <FaPenNib />
              <span>Publicaciones</span>
            </button>
            <button 
              className={`admin-nav__item ${activeSection === 'revistas' ? 'active' : ''}`}
              onClick={() => setActiveSection('revistas')}
            >
              <HiOutlinePhotograph />
              <span>Revistas</span>
            </button>
            <button 
              className={`admin-nav__item ${activeSection === 'categorias' ? 'active' : ''}`}
              onClick={() => setActiveSection('categorias')}
            >
              <FaTag />
              <span>Categorías</span>
            </button>
            <button 
              className={`admin-nav__item ${activeSection === 'autores' ? 'active' : ''}`}
              onClick={() => setActiveSection('autores')}
            >
              <FaPenNib />
              <span>Autores</span>
            </button>
          </nav>
          <button onClick={handleLogout} className="admin-sidebar__logout">
            Cerrar sesión
          </button>
        </aside>

        <section className="admin-panel">
          <header className="admin-panel__header">
            <h1>Panel editorial</h1>
            <p>Publica crónicas del colectivo Diván Japonés y coordina los próximos ciclos.</p>
          </header>

          <p
            className={`admin-panel__status${postsSyncError ? ' is-error' : ''}`}
            aria-live="polite"
          >
            {postsSyncError
              ? postsSyncError
              : isSyncingPosts
                ? 'Sincronizando con la base de datos...'
                : 'Conectado a la base de datos Neon.'}
          </p>

          {activeSection === 'publicaciones' ? (
            <>
              <div className="admin-panel__tabs" role="group" aria-label="Componentes del contenido">
                <button type="button" className="is-active" disabled>
                  Publicación base
                </button>
                <button
                  type="button"
                  className={formState.hasActivity ? 'is-active' : ''}
                  onClick={toggleActivityComponent}
                  aria-pressed={formState.hasActivity}
                >
                  Añadir actividad enlazada
                </button>
              </div>

              <form className="admin-form" onSubmit={handleSubmit}>
                <fieldset className="admin-card">
                  <legend>Datos generales</legend>
                  <div className="admin-form__row">
                    <label htmlFor="title">Título *</label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={formState.title}
                      onChange={handleChange}
                      placeholder="Ingresa un título claro y conciso"
                    />
                  </div>

                  <div className="admin-form__row admin-form__row--split">
                    <div>
                      <label htmlFor="category">Categoría *</label>
                      <div className="admin-input-with-icon">
                        <FaTag aria-hidden="true" />
                        <select
                          id="category"
                          name="category"
                          required
                          value={formState.category}
                          onChange={handleCategoryChange}
                        >
                          <option value="">Seleccionar categoría</option>
                          {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subcategory">Subcategoría</label>
                      <div className="admin-input-with-icon">
                        <FaListUl aria-hidden="true" />
                        <input
                          id="subcategory"
                          name="subcategory"
                          list="subcategory-options"
                          value={formState.subcategory}
                          onChange={handleChange}
                          placeholder="Selecciona o escribe una subcategoría"
                          disabled={!formState.category?.trim()}
                        />
                      </div>
                      <datalist id="subcategory-options">
                        {subcategoryOptions.map((subcategory) => (
                          <option key={subcategory} value={subcategory} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="admin-form__row">
                    <label htmlFor="author">Autor</label>
                    <div className="admin-input-with-icon">
                      <FaPenNib aria-hidden="true" />
                      <select
                        id="author"
                        name="author"
                        value={formState.author}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar autor</option>
                        {dbAuthors.map((author) => (
                          <option key={author.id} value={author.name}>
                            {author.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-form__row admin-form__row--split">
                    <div>
                      <label htmlFor="publishedAt">Fecha de publicación</label>
                      <div className="admin-input-with-icon">
                        <FaCalendarAlt aria-hidden="true" />
                        <input
                          id="publishedAt"
                          name="publishedAt"
                          type="datetime-local"
                          value={formState.publishedAt}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="imageUrl">Imagen destacada (URL)</label>
                      <div className="admin-input-with-icon">
                        <FaImage aria-hidden="true" />
                        <input
                          id="imageUrl"
                          name="imageUrl"
                          type="url"
                          value={formState.imageUrl}
                          onChange={handleChange}
                          placeholder="https://..."
                        />
                      </div>
                      <small>Pega la URL pública (https://) donde alojaste la imagen.</small>
                    </div>
                  </div>
                </fieldset>

                <div className="admin-form__actions" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                  <button type="button" className="admin-form__secondary" onClick={clearGeneralFields}>
                    Limpiar datos generales
                  </button>
                </div>

                {formState.hasActivity ? (
                  <fieldset className="admin-card">
                    <legend>Detalles de la actividad</legend>
                    <div className="admin-form__row admin-form__row--split">
                      <div>
                        <label htmlFor="scheduledAt">Fecha programada *</label>
                        <div className="admin-input-with-icon">
                          <MdOutlineSchedule aria-hidden="true" />
                          <input
                            id="scheduledAt"
                            name="scheduledAt"
                            type="datetime-local"
                            value={formState.scheduledAt}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="location">Lugar del encuentro *</label>
                        <div className="admin-input-with-icon">
                          <FaMapMarkerAlt aria-hidden="true" />
                          <input
                            id="location"
                            name="location"
                            type="text"
                            value={formState.location}
                            onChange={handleChange}
                            required
                            placeholder="Dirección o formato (online)"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="price">Valor</label>
                        <div className="admin-input-with-icon">
                          <MdPriceChange aria-hidden="true" />
                          <input
                            id="price"
                            name="price"
                            type="text"
                            placeholder="Ej. Gratuito, $15.000 CLP"
                            value={formState.price}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>
                ) : null}

                <fieldset className="admin-card">
                  <legend>Contenido</legend>
                  <div className="admin-form__row">
                    <label htmlFor="excerpt">Resumen</label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      rows="3"
                      maxLength="300"
                      value={formState.excerpt}
                      onChange={handleChange}
                      placeholder="Describe brevemente el enfoque de la nota o actividad"
                    />
                  </div>

                  <div className="admin-form__row">
                    <label htmlFor="content">Contenido</label>
                    <TiptapEditor
                      content={formState.content}
                      onChange={(html) => setFormState(prev => ({ ...prev, content: html }))}
                      placeholder="Redacta el desarrollo completo"
                    />
                  </div>
                </fieldset>

                {error && <p className="admin-form__error">{error}</p>}
                {successMessage && <p className="admin-form__success">{successMessage}</p>}

                <div className="admin-form__actions">
                  {editingPostId ? (
                    <button type="button" className="admin-form__secondary" onClick={handleCancel}>
                      Cancelar
                    </button>
                  ) : null}
                  <button type="submit" className="admin-form__primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando…' : editingPostId ? 'Actualizar artículo' : 'Publicar artículo'}
                  </button>
                </div>
              </form>

              {/* Debug: mostrar último payload enviado (útil para verificar desde móvil) */}
              {typeof window !== 'undefined' ? (
                <DebugLastPayload />
              ) : null}

              {/* Lista de publicaciones existentes */}
              <div className="admin-posts__list">
                <h3>Publicaciones existentes</h3>
                {publications.length > 0 ? (
                  <div className="admin-items__grid">
                    {publications.map(post => (
                      <div key={post.id} className="admin-item__card">
                        <div className="admin-item__content">
                          <h4>{post.title}</h4>
                          <p><strong>Categoría:</strong> {post.category}</p>
                          <p><strong>Autor:</strong> {post.author}</p>
                          <p><strong>Fecha:</strong> {new Date(post.publishedAt).toLocaleDateString('es-MX')}</p>
                        </div>
                        <div className="admin-item__actions">
                          <button 
                            type="button" 
                            className="admin-btn__edit"
                            onClick={() => handleEditPost(post)}
                          >
                            Editar
                          </button>
                          <button 
                            type="button" 
                            className="admin-btn__delete"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay publicaciones disponibles.</p>
                )}

                <h3 style={{marginTop: '3rem'}}>Eventos existentes</h3>
                {activities.length > 0 ? (
                  <div className="admin-items__grid">
                    {activities.map(post => (
                      <div key={post.id} className="admin-item__card">
                        <div className="admin-item__content">
                          <h4>{post.title}</h4>
                          <p><strong>Categoría:</strong> {post.category}</p>
                          <p><strong>Lugar:</strong> {post.location}</p>
                          <p><strong>Fecha evento:</strong> {new Date(post.scheduledAt).toLocaleDateString('es-MX')}</p>
                          {post.price && <p><strong>Precio:</strong> {post.price}</p>}
                        </div>
                        <div className="admin-item__actions">
                          <button 
                            type="button" 
                            className="admin-btn__edit"
                            onClick={() => handleEditPost(post)}
                          >
                            Editar
                          </button>
                          <button 
                            type="button" 
                            className="admin-btn__delete"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay eventos disponibles.</p>
                )}
              </div>
            </>
          ) : null}

          {activeSection === 'revistas' ? (
            <section className="admin-magazines">
              <header className="admin-magazines__header">
                <h2>Revista digital</h2>
                <p>Gestiona las ediciones digitales que se muestran en el visor de la revista.</p>
              </header>

              <p
                className={`admin-panel__status${magazinesSyncError ? ' is-error' : ''}`}
                aria-live="polite"
              >
                {magazinesSyncError
                  ? magazinesSyncError
                  : isSyncingMagazines
                    ? 'Sincronizando revistas...'
                    : 'Revistas sincronizadas'}
              </p>

              <form className="admin-form admin-magazines__form" onSubmit={handleMagazineSubmit}>
                <fieldset className="admin-card">
                  <legend>Información de la edición</legend>
                  <div className="admin-form__row">
                    <label htmlFor="magazine-title">Título *</label>
                    <input
                      id="magazine-title"
                      name="title"
                      type="text"
                      required
                      value={magazineForm.title}
                      onChange={handleMagazineChange}
                      placeholder="Ej. Edición otoño 2025"
                    />
                  </div>

                  <div className="admin-form__row">
                    <label htmlFor="magazine-description">Descripción</label>
                    <textarea
                      id="magazine-description"
                      name="description"
                      rows="3"
                      value={magazineForm.description}
                      onChange={handleMagazineChange}
                      placeholder="Resume los temas principales de la edición"
                    />
                  </div>

                  <div className="admin-form__row admin-form__row--split">
                    <div>
                      <label htmlFor="magazine-releaseDate">Fecha de lanzamiento</label>
                      <div className="admin-input-with-icon">
                        <FaCalendarAlt aria-hidden="true" />
                        <input
                          id="magazine-releaseDate"
                          name="releaseDate"
                          type="date"
                          value={magazineForm.releaseDate}
                          onChange={handleMagazineChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="magazine-coverUrl">Portada (URL)</label>
                      <div className="admin-input-with-icon">
                        <FaImage aria-hidden="true" />
                        <input
                          id="magazine-coverUrl"
                          name="coverUrl"
                          type="url"
                          value={magazineForm.coverUrl}
                          onChange={handleMagazineChange}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form__row">
                    <label htmlFor="magazine-pdfUrl">Edición en PDF (URL pública)</label>
                    <div className="admin-input-with-icon">
                      <FaFilePdf aria-hidden="true" />
                      <input
                        id="magazine-pdfUrl"
                        name="pdfUrl"
                        type="url"
                        value={magazineForm.pdfUrl}
                        onChange={handleMagazineChange}
                        placeholder="https://..."
                        required={!magazineForm.viewerUrl}
                      />
                    </div>
                    <small>Debe ser un enlace directo a un PDF accesible (https://) para que se muestre en el visor.</small>
                  </div>

                  <div className="admin-form__row">
                    <label htmlFor="magazine-viewerUrl">Visor externo (URL)</label>
                    <div className="admin-input-with-icon">
                      <FaExternalLinkAlt aria-hidden="true" />
                      <input
                        id="magazine-viewerUrl"
                        name="viewerUrl"
                        type="url"
                        value={magazineForm.viewerUrl}
                        onChange={handleMagazineChange}
                        placeholder="https://issuu.com/..."
                      />
                    </div>
                    <small>Se abrirá en una pestaña nueva cuando no haya PDF directo.</small>
                  </div>
                </fieldset>

                <div className="admin-form__actions" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                  <button type="button" className="admin-form__secondary" onClick={clearMagazineInfo}>
                    Limpiar información de la edición
                  </button>
                </div>

                <fieldset className="admin-card">
                  <legend>Artículos individuales de la revista</legend>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                    Agrega los artículos individuales con sus PDFs para descarga por separado.
                  </p>

                  <div className="admin-form__row admin-form__row--split">
                    <div>
                      <label htmlFor="article-title">Título del artículo</label>
                      <div className="admin-input-with-icon">
                        <FaPenNib aria-hidden="true" />
                        <input
                          id="article-title"
                          name="title"
                          type="text"
                          value={magazineArticleForm.title}
                          onChange={handleMagazineArticleChange}
                          placeholder="Ej. El psicoanálisis en el manga"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="article-author">Autor</label>
                      <div className="admin-input-with-icon">
                        <FaPenNib aria-hidden="true" />
                        <input
                          id="article-author"
                          name="author"
                          type="text"
                          value={magazineArticleForm.author}
                          onChange={handleMagazineArticleChange}
                          placeholder="Nombre del autor"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form__row admin-form__row--split">
                    <div>
                      <label htmlFor="article-pdfUrl">URL del PDF del artículo *</label>
                      <div className="admin-input-with-icon">
                        <FaFilePdf aria-hidden="true" />
                        <input
                          id="article-pdfUrl"
                          name="pdfUrl"
                          type="url"
                          value={magazineArticleForm.pdfUrl}
                          onChange={handleMagazineArticleChange}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="article-pageNumber">Número de página (opcional)</label>
                      <div className="admin-input-with-icon">
                        <FaListUl aria-hidden="true" />
                        <input
                          id="article-pageNumber"
                          name="pageNumber"
                          type="number"
                          min="1"
                          value={magazineArticleForm.pageNumber}
                          onChange={handleMagazineArticleChange}
                          placeholder="Ej. 5"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="admin-form__secondary"
                      style={{ alignSelf: 'flex-start' }}
                      onClick={handleAddArticleToMagazine}
                    >
                      {editingArticleIndex !== null ? 'Actualizar artículo' : '+ Agregar artículo'}
                    </button>
                    {editingArticleIndex !== null && (
                      <button
                        type="button"
                        className="admin-form__secondary"
                        style={{ alignSelf: 'flex-start', background: '#6c757d' }}
                        onClick={handleCancelEditArticle}
                      >
                        Cancelar edición
                      </button>
                    )}
                  </div>

                  {magazineForm.articles.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        Artículos agregados ({magazineForm.articles.length})
                      </h4>
                      <ul className="admin-magazines__list">
                        {magazineForm.articles.map((article, index) => (
                          <li key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            backgroundColor: editingArticleIndex === index ? '#fff3cd' : 'transparent',
                            padding: editingArticleIndex === index ? '0.5rem' : '0',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s'
                          }}>
                            <div>
                              <span>{article.title}</span>
                              <span className="admin-magazines__list-meta">
                                {article.author || 'Sin autor'} {article.pageNumber && `· Pág. ${article.pageNumber}`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => handleEditArticleInMagazine(index)}
                                disabled={editingArticleIndex === index}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: editingArticleIndex === index ? '#999' : '#007bff',
                                  cursor: editingArticleIndex === index ? 'not-allowed' : 'pointer',
                                  padding: '0.5rem',
                                }}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveArticleFromMagazine(index)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#a80000',
                                  cursor: 'pointer',
                                  padding: '0.5rem',
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </fieldset>

                {magazineError && <p className="admin-form__error">{magazineError}</p>}
                {magazineSuccess && <p className="admin-form__success">{magazineSuccess}</p>}

                <div className="admin-form__actions">
                  {editingMagazineId ? (
                    <button type="button" className="admin-form__secondary" onClick={handleMagazineCancel}>
                      Cancelar
                    </button>
                  ) : null}
                  <button type="submit" className="admin-form__primary" disabled={isSavingMagazine}>
                    {isSavingMagazine ? 'Guardando…' : editingMagazineId ? 'Actualizar revista' : 'Publicar revista'}
                  </button>
                </div>
              </form>

              <div className="admin-magazines__summary">
                <h3>Revistas publicadas</h3>
                {magazines.length ? (
                  <div className="admin-items__grid">
                    {magazines.map((magazine) => (
                      <div key={magazine.id} className="admin-item__card">
                        <div className="admin-item__content">
                          <h4>{magazine.title}</h4>
                          <p><strong>Fecha:</strong> {formatReleaseDate(magazine.releaseDate)}</p>
                          <p><strong>Tipo:</strong> {magazine.fileName || (magazine.viewerUrl ? 'Visor externo' : 'PDF pendiente')}</p>
                          {magazine.description && <p className="admin-item__excerpt">{magazine.description.slice(0, 100)}...</p>}
                        </div>
                        <div className="admin-item__actions">
                          <button 
                            type="button" 
                            className="admin-btn__edit"
                            onClick={() => handleEditMagazine(magazine)}
                          >
                            Editar
                          </button>
                          <button 
                            type="button" 
                            className="admin-btn__delete"
                            onClick={() => handleDeleteMagazine(magazine.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-magazines__empty">Aún no has publicado ediciones.</p>
                )}
              </div>
            </section>
          ) : null}

          {activeSection === 'categorias' ? (
            <div className="admin-section">
              <h2>Gestión de Categorías</h2>
              <p className="admin-section__description">
                Crea y administra las categorías disponibles para clasificar las publicaciones.
              </p>

              <form className="admin-form admin-category-form" onSubmit={handleAddCategory}>
                <fieldset className="admin-card">
                  <legend>Agregar nueva categoría</legend>
                  <div className="admin-form__row">
                    <label htmlFor="category-name">Nombre de la categoría *</label>
                    <input
                      id="category-name"
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ej. Psicoanálisis"
                      required
                    />
                  </div>

                  {categoryError && <p className="admin-form__error">{categoryError}</p>}
                  {categorySuccess && <p className="admin-form__success">{categorySuccess}</p>}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button type="submit" className="admin-form__primary">
                      {editingCategoryId ? 'Actualizar categoría' : 'Agregar categoría'}
                    </button>
                    {editingCategoryId ? (
                      <button type="button" className="admin-form__secondary" onClick={handleCancelEditCategory}>
                        Cancelar edición
                      </button>
                    ) : null}
                  </div>
                </fieldset>
              </form>

              <div className="admin-card">
                <h3>Categorías existentes ({dbCategories.length})</h3>
                {isLoadingCategories ? (
                  <p className="empty-message">Cargando categorías...</p>
                ) : dbCategories.length > 0 ? (
                  <ul className="category-list">
                    {dbCategories.map((cat) => (
                      <li key={cat.id} className="category-item">
                        <div className="category-item__info">
                          <span className="category-name">{cat.name}</span>
                          <span className="category-count">
                            {categoryPostCounts[slugify(cat.name)] || 0} publicaciones
                          </span>
                        </div>
                        <button
                          type="button"
                          className="author-delete-btn"
                          onClick={() => handleEditCategory(cat)}
                          aria-label={`Editar categoría ${cat.name}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="author-delete-btn"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          aria-label={`Eliminar categoría ${cat.name}`}
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-message">No hay categorías creadas aún.</p>
                )}
              </div>
            </div>
          ) : null}

          {activeSection === 'autores' ? (
            <div className="admin-section">
              <h2>Gestión de Autores</h2>
              <p className="admin-section__description">
                Administra los autores que pueden ser asignados a las publicaciones.
              </p>

              <form className="admin-form admin-author-form" onSubmit={handleAddAuthor}>
                <fieldset className="admin-card">
                  <legend>Agregar nuevo autor</legend>
                  <div className="admin-form__row">
                    <label htmlFor="author-name">Nombre del autor *</label>
                    <input
                      id="author-name"
                      type="text"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      required
                    />
                  </div>

                  <div className="admin-form__row">
                    <label htmlFor="author-image-url">Imagen de perfil (URL, opcional)</label>
                    <input
                      id="author-image-url"
                      type="url"
                      placeholder="https://..."
                      value={newAuthorImageUrl}
                      onChange={handleAuthorImageUrlChange}
                    />
                    {newAuthorImageUrl && isValidUrl(newAuthorImageUrl) ? (
                      <div className="author-image-preview">
                        <img src={newAuthorImageUrl} alt="Preview" />
                      </div>
                    ) : null}
                  </div>

                  {authorError && <p className="admin-form__error">{authorError}</p>}
                  {authorSuccess && <p className="admin-form__success">{authorSuccess}</p>}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button type="submit" className="admin-form__primary">
                      {editingAuthorId ? 'Actualizar autor' : 'Agregar autor'}
                    </button>
                    {editingAuthorId ? (
                      <button type="button" className="admin-form__secondary" onClick={handleCancelEditAuthor}>
                        Cancelar edición
                      </button>
                    ) : null}
                  </div>
                </fieldset>
              </form>

              <div className="admin-card">
                <h3>Autores existentes ({dbAuthors.length})</h3>
                {isLoadingAuthors ? (
                  <p className="empty-message">Cargando autores...</p>
                ) : dbAuthors.length > 0 ? (
                  <ul className="author-list">
                    {dbAuthors.map((author) => (
                      <li key={author.id} className="author-item">
                        <div className="author-item__info">
                          <span className="author-name">{author.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="author-delete-btn"
                            onClick={() => handleEditAuthor(author)}
                            aria-label={`Editar autor ${author.name}`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="author-delete-btn"
                            onClick={() => handleDeleteAuthor(author.id, author.name)}
                            aria-label={`Eliminar autor ${author.name}`}
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-message">No hay autores creados aún.</p>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
