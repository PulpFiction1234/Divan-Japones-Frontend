import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import initialPosts from '../data/initialPosts'
import initialMagazines from '../data/initialMagazines'
import slugify from '../utils/slugify'
import PUBLICATION_CATEGORIES from '../constants/publicationCategories'
import { createArticle, fetchArticles, createMagazine, fetchMagazines, updateArticle, deleteArticle, updateMagazine, deleteMagazine } from '../services/api'

const DEFAULT_AUTHOR = ''
const DEFAULT_MAGAZINE_COVER = 'https://placehold.co/900x600?text=Revista'

const PostsContext = createContext(undefined)
const NORMALIZED_INITIAL_POSTS = sortByPublishedDate(initialPosts.map((post) => normalizePost(post)).filter(Boolean))
const NORMALIZED_INITIAL_MAGAZINES = sortMagazines(
  initialMagazines.map((magazine) => normalizeMagazine(magazine)).filter(Boolean),
)

function postsReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return sortByPublishedDate(action.payload)
    case 'ADD_POST':
      return sortByPublishedDate([action.payload, ...state])
    case 'UPDATE_POST':
      return sortByPublishedDate(state.map(post => post.id === action.payload.id ? action.payload : post))
    case 'DELETE_POST':
      return state.filter(post => post.id !== action.payload)
    default:
      return state
  }
}

function magazinesReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return sortMagazines(action.payload)
    case 'ADD_MAGAZINE':
      return sortMagazines([action.payload, ...state])
    case 'UPDATE_MAGAZINE':
      return sortMagazines(state.map(mag => mag.id === action.payload.id ? action.payload : mag))
    case 'DELETE_MAGAZINE':
      return state.filter(mag => mag.id !== action.payload)
    default:
      return state
  }
}

function sortByPublishedDate(posts) {
  return [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

function sortMagazines(magazines) {
  return [...magazines].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

function normalizePost(rawPost) {
  if (!rawPost) {
    return null
  }

  const baseType = rawPost.type === 'activity' ? 'activity' : 'publication'
  const isActivity = rawPost.is_activity === true || rawPost.isActivity === true || baseType === 'activity'
  const type = baseType
  const title = rawPost.title ?? 'Sin título'
  const publishedAt = rawPost.published_at || rawPost.publishedAt ? new Date(rawPost.published_at || rawPost.publishedAt).toISOString() : new Date().toISOString()
  const scheduledAt = rawPost.scheduled_at || rawPost.scheduledAt ? new Date(rawPost.scheduled_at || rawPost.scheduledAt).toISOString() : null
  const price = typeof rawPost.price === 'string' ? rawPost.price : rawPost.price?.toString?.() ?? ''
  const location = rawPost.location ?? ''
  const viewCount = Number(rawPost.view_count || rawPost.viewCount) || 0
  const category = rawPost.category?.trim?.() ?? (type === 'activity' ? '' : 'General')
  const subcategory = rawPost.subcategory?.trim?.() ?? ''
  const slug = rawPost.slug || slugify(title)

  return {
    id: rawPost.id,
    slug,
    title,
    category,
    subcategory,
    author: rawPost.author ?? DEFAULT_AUTHOR,
    excerpt: rawPost.excerpt ?? '',
    content: rawPost.content ?? '',
    image: rawPost.image_url || rawPost.image || '',
    publishedAt,
    type,
    isActivity,
    scheduledAt,
    price,
    location,
    viewCount,
  }
}

function normalizeMagazine(rawMagazine) {
  if (!rawMagazine) {
    return null
  }

  const pdfSource = typeof rawMagazine.pdfSource === 'string' ? rawMagazine.pdfSource.trim() : (rawMagazine.pdf_source || rawMagazine.pdf_url || '')
  const viewerUrl = rawMagazine.viewerUrl?.trim() || rawMagazine.viewer_url?.trim() || ''
  const createdAt = rawMagazine.createdAt || rawMagazine.created_at ? new Date(rawMagazine.createdAt || rawMagazine.created_at).toISOString() : new Date().toISOString()
  const releaseDate = rawMagazine.releaseDate || rawMagazine.release_date ? new Date(rawMagazine.releaseDate || rawMagazine.release_date).toISOString() : null
  const coverImage = rawMagazine.coverImage?.trim() || rawMagazine.cover_image?.trim() || rawMagazine.cover_url?.trim() || DEFAULT_MAGAZINE_COVER
  const hasPdf = Boolean(pdfSource)
  const hasViewer = Boolean(viewerUrl)
  const isPdfPersisted = rawMagazine.isPdfPersisted === false || rawMagazine.is_pdf_persisted === false ? false : hasPdf

  return {
    id:
      rawMagazine.id ??
      (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `magazine-${Date.now()}`),
    title: rawMagazine.title?.trim() || 'Edición sin título',
    description: rawMagazine.description?.trim() || '',
    pdfSource,
    viewerUrl,
    coverImage,
    createdAt,
    releaseDate,
    fileName: rawMagazine.fileName?.trim() || rawMagazine.file_name?.trim() || '',
    hasPdf,
    hasViewer,
    isPdfPersisted,
  }
}



function createPost(payload) {
  const resolvedType = payload.type === 'activity' ? 'activity' : 'publication'
  // Accept both `isActivity` and `hasActivity` (admin form uses hasActivity)
  const includesActivity = payload.isActivity === true || payload.hasActivity === true || resolvedType === 'activity'
  const base = {
    ...payload,
    id: payload.id ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `post-${Date.now()}`),
    type: resolvedType,
    isActivity: includesActivity,
    category: payload.category?.trim?.() || 'General',
    subcategory: payload.subcategory?.trim?.() ?? '',
    publishedAt: payload.publishedAt ? new Date(payload.publishedAt).toISOString() : new Date().toISOString(),
    viewCount: Number(payload.viewCount) || 0,
    // Normalize image and activity-related fields coming from different sources/forms
    image: payload.image || payload.imageUrl || payload.image_url || '',
    scheduledAt: includesActivity && (payload.scheduledAt || payload.scheduled_at) ? new Date(payload.scheduledAt || payload.scheduled_at).toISOString() : null,
    price: includesActivity ? (payload.price ?? '') : '',
    location: includesActivity ? (payload.location ?? '') : '',
  }

  return normalizePost(base)
}

function normalizeMagazineInput(payload) {
  return normalizeMagazine({
    ...payload,
    id:
      payload.id ??
      (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `magazine-${Date.now()}`),
    createdAt: payload.createdAt ? new Date(payload.createdAt).toISOString() : new Date().toISOString(),
    releaseDate: payload.releaseDate ? new Date(payload.releaseDate).toISOString() : null,
    viewerUrl: payload.viewerUrl ?? '',
  })
}

export function PostsProvider({ children }) {
  const [posts, dispatchPosts] = useReducer(postsReducer, NORMALIZED_INITIAL_POSTS)
  const [magazines, dispatchMagazines] = useReducer(magazinesReducer, NORMALIZED_INITIAL_MAGAZINES)
  const [isSyncingPosts, setIsSyncingPosts] = useState(false)
  const [postsSyncError, setPostsSyncError] = useState(null)
  const [isSyncingMagazines, setIsSyncingMagazines] = useState(false)
  const [magazinesSyncError, setMagazinesSyncError] = useState(null)

  const syncPostsFromApi = useCallback(async ({ signal } = {}) => {
    const remotePosts = await fetchArticles({ signal })
    const normalized = Array.isArray(remotePosts)
      ? remotePosts.map((post) => normalizePost(post)).filter(Boolean)
      : []
    dispatchPosts({ type: 'INIT', payload: normalized })
    return normalized
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    const sync = async () => {
      setIsSyncingPosts(true)
      try {
        await syncPostsFromApi({ signal: controller.signal })
        if (isMounted) {
          setPostsSyncError(null)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed syncing posts', error)
          if (isMounted) {
            setPostsSyncError('No se pudo sincronizar con la base de datos. Mostrando datos locales.')
          }
        }
      } finally {
        if (isMounted) {
          setIsSyncingPosts(false)
        }
      }
    }

    sync()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [syncPostsFromApi])

  const syncMagazinesFromApi = useCallback(async ({ signal } = {}) => {
    const remoteMagazines = await fetchMagazines({ signal })
    const normalized = Array.isArray(remoteMagazines)
      ? remoteMagazines.map((mag) => normalizeMagazine(mag)).filter(Boolean)
      : []
    dispatchMagazines({ type: 'INIT', payload: normalized })
    return normalized
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    const sync = async () => {
      setIsSyncingMagazines(true)
      try {
        await syncMagazinesFromApi({ signal: controller.signal })
        if (isMounted) {
          setMagazinesSyncError(null)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed syncing magazines', error)
          if (isMounted) {
            setMagazinesSyncError('No se pudo sincronizar las revistas con la base de datos.')
          }
        }
      } finally {
        if (isMounted) {
          setIsSyncingMagazines(false)
        }
      }
    }

    sync()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [syncMagazinesFromApi])

  const addPost = useCallback(async (postInput) => {
    const prepared = createPost(postInput)
    if (!prepared) {
      throw new Error('No se pudo preparar el artículo para guardar.')
    }

    try {
      const saved = await createArticle({
        title: prepared.title,
        category: prepared.category,
        subcategory: prepared.subcategory,
        author: prepared.author,
        excerpt: prepared.excerpt,
        content: prepared.content,
        imageUrl: prepared.image,
        publishedAt: prepared.publishedAt,
        type: prepared.type,
        isActivity: prepared.isActivity,
        scheduledAt: prepared.scheduledAt,
        location: prepared.location,
        price: prepared.price,
      })

      const normalized = createPost(saved)
      dispatchPosts({ type: 'ADD_POST', payload: normalized })
      setPostsSyncError(null)
      return normalized
    } catch (error) {
      console.error('Failed saving article', error)
      throw error
    }
  }, [])

  const addMagazine = useCallback(async (magazineInput) => {
    const prepared = normalizeMagazineInput(magazineInput)
    if (!prepared) {
      throw new Error('No se pudo preparar la revista para guardar.')
    }

    try {
      const saved = await createMagazine({
        title: prepared.title,
        description: prepared.description,
        pdfUrl: prepared.pdfSource,
        viewerUrl: prepared.viewerUrl,
        coverUrl: prepared.coverImage,
        releaseDate: prepared.releaseDate,
        fileName: prepared.fileName,
      })

      const normalized = normalizeMagazineInput(saved)
      dispatchMagazines({ type: 'ADD_MAGAZINE', payload: normalized })
      setMagazinesSyncError(null)
      return normalized
    } catch (error) {
      console.error('Failed saving magazine', error)
      throw error
    }
  }, [])

  const updatePost = useCallback(async (id, postInput) => {
    const prepared = createPost(postInput)
    if (!prepared) {
      throw new Error('No se pudo preparar el artículo para actualizar.')
    }

    try {
      const saved = await updateArticle(id, {
        title: prepared.title,
        category: prepared.category,
        subcategory: prepared.subcategory,
        author: prepared.author,
        excerpt: prepared.excerpt,
        content: prepared.content,
        imageUrl: prepared.image,
        publishedAt: prepared.publishedAt,
        type: prepared.type,
        isActivity: prepared.isActivity,
        scheduledAt: prepared.scheduledAt,
        location: prepared.location,
        price: prepared.price,
      })

      const normalized = createPost(saved)
      dispatchPosts({ type: 'UPDATE_POST', payload: normalized })
      setPostsSyncError(null)
      return normalized
    } catch (error) {
      console.error('Failed updating article', error)
      throw error
    }
  }, [])

  const deletePost = useCallback(async (id) => {
    try {
      await deleteArticle(id)
      dispatchPosts({ type: 'DELETE_POST', payload: id })
      setPostsSyncError(null)
    } catch (error) {
      console.error('Failed deleting article', error)
      throw error
    }
  }, [])

  const updateMagazineById = useCallback(async (id, magazineInput) => {
    const prepared = normalizeMagazineInput(magazineInput)
    if (!prepared) {
      throw new Error('No se pudo preparar la revista para actualizar.')
    }

    try {
      const saved = await updateMagazine(id, {
        title: prepared.title,
        description: prepared.description,
        pdfUrl: prepared.pdfSource,
        viewerUrl: prepared.viewerUrl,
        coverUrl: prepared.coverImage,
        releaseDate: prepared.releaseDate,
        fileName: prepared.fileName,
      })

      const normalized = normalizeMagazineInput(saved)
      dispatchMagazines({ type: 'UPDATE_MAGAZINE', payload: normalized })
      setMagazinesSyncError(null)
      return normalized
    } catch (error) {
      console.error('Failed updating magazine', error)
      throw error
    }
  }, [])

  const deleteMagazineById = useCallback(async (id) => {
    try {
      await deleteMagazine(id)
      dispatchMagazines({ type: 'DELETE_MAGAZINE', payload: id })
      setMagazinesSyncError(null)
    } catch (error) {
      console.error('Failed deleting magazine', error)
      throw error
    }
  }, [])

  const refreshPosts = useCallback(async () => {
    setIsSyncingPosts(true)
    try {
      await syncPostsFromApi()
      setPostsSyncError(null)
    } catch (error) {
      console.error('Manual sync failed', error)
      setPostsSyncError('No se pudo sincronizar con la base de datos.')
      throw error
    } finally {
      setIsSyncingPosts(false)
    }
  }, [syncPostsFromApi])

  const refreshMagazines = useCallback(async () => {
    setIsSyncingMagazines(true)
    try {
      await syncMagazinesFromApi()
      setMagazinesSyncError(null)
    } catch (error) {
      console.error('Manual magazine sync failed', error)
      setMagazinesSyncError('No se pudo sincronizar las revistas.')
      throw error
    } finally {
      setIsSyncingMagazines(false)
    }
  }, [syncMagazinesFromApi])

  const value = useMemo(() => {
    const categoryMap = new Map()

    PUBLICATION_CATEGORIES.forEach((category) => {
      categoryMap.set(category.slug, {
        name: category.name,
        slug: category.slug,
        subcategories: (category.subcategories ?? []).map((item) => ({ ...item })),
      })
    })

    const activities = posts.filter((post) => post.isActivity)
    const publications = posts.filter((post) => !post.isActivity)

    posts.forEach((post) => {
      const baseName = post.category?.trim() || 'General'
      const slug = slugify(baseName)
      const existing = categoryMap.get(slug)
      let entry = existing ?? { name: baseName, slug, subcategories: [] }

      const subcategoryName = post.subcategory?.trim()
      if (subcategoryName) {
        const list = entry.subcategories ?? []
        const alreadyIncluded = list.some((item) => item.name.toLowerCase() === subcategoryName.toLowerCase())
        if (!alreadyIncluded) {
          entry = {
            ...entry,
            subcategories: [...list, { name: subcategoryName, slug: slugify(`${slug}-${subcategoryName}`) }],
          }
        }
      }

      categoryMap.set(slug, entry)
    })

    const orderedBase = PUBLICATION_CATEGORIES.map((category) => categoryMap.get(category.slug)).filter(Boolean)
    const extras = Array.from(categoryMap.values()).filter(
      (category) => !PUBLICATION_CATEGORIES.find((base) => base.slug === category.slug),
    )
    const categories = [...orderedBase, ...extras.sort((a, b) => a.name.localeCompare(b.name))]

    function getPostsByCategorySlug(categorySlug) {
      return posts.filter((post) => slugify(post.category) === categorySlug)
    }

    function getCategoryBySlug(categorySlug) {
      return categories.find((item) => item.slug === categorySlug) ?? null
    }

    function getPostById(postId) {
      return posts.find((post) => post.id === postId) ?? null
    }

    return {
      posts,
      publications,
      activities,
      categories,
      magazines,
      addPost,
      updatePost,
      deletePost,
      addMagazine,
      updateMagazine: updateMagazineById,
      deleteMagazine: deleteMagazineById,
      isSyncingPosts,
      postsSyncError,
      isSyncingMagazines,
      magazinesSyncError,
      refreshPosts,
      refreshMagazines,
      getPostsByCategorySlug,
      getCategoryBySlug,
      getPostById,
      getMagazineById: (magazineId) => magazines.find((mag) => mag.id === magazineId) ?? null,
    }
  }, [
    posts,
    magazines,
    addPost,
    updatePost,
    deletePost,
    addMagazine,
    updateMagazineById,
    deleteMagazineById,
    isSyncingPosts,
    postsSyncError,
    isSyncingMagazines,
    magazinesSyncError,
    refreshPosts,
    refreshMagazines,
  ])

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePosts() {
  const context = useContext(PostsContext)

  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider')
  }

  return context
}
