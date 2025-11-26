import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import SiteFooter from '../components/Footer'
import { usePosts } from '../context/PostsContext'
import slugify from '../utils/slugify'
import formatCategoryLabel from '../utils/formatCategoryLabel'
import TrendingPostsSection from '../components/TrendingPostsSection'
import AuthorPill from '../components/AuthorPill'

const FALLBACK_IMAGE = 'https://placehold.co/1200x800?text=Divan'

function formatDate(value) {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ArticlePage() {
  const { postId } = useParams()
  const { posts } = usePosts()

  const post = useMemo(() => {
    return posts.find(p => p.slug === postId || p.id === postId)
  }, [posts, postId])
  const isActivity = post?.isActivity
  const baseCategory = post?.category || 'General'
  const categoryLabel = formatCategoryLabel(post, {
    includeActivityPrefix: Boolean(isActivity),
    fallback: isActivity ? 'Actividades' : 'General',
  })
  const footerLink = isActivity
    ? '/actividades'
    : `/publicaciones?category=${slugify(baseCategory || 'general')}`
  const footerLabel = isActivity ? 'Ver todas las actividades' : `Ver más sobre ${baseCategory}`
  const publishedDate = formatDate(post?.publishedAt)
  const heroImage = post?.image || FALLBACK_IMAGE
  const activityDate = isActivity ? formatDate(post?.scheduledAt || post?.publishedAt) : null
  const activityLocation = isActivity ? post?.location?.trim() : ''
  const activityPrice = isActivity ? post?.price?.trim() : ''
  const activityDetails = isActivity
    ? [
        activityLocation ? `Lugar: ${activityLocation}` : null,
        activityPrice ? `Valor: ${activityPrice}` : null,
      ].filter(Boolean)
    : []

  const recentPosts = useMemo(() => {
    if (!publications?.length) {
      return []
    }

    return publications
      .filter((item) => item.id !== postId)
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
      .slice(0, 3)
  }, [publications, postId])

  const categoryIndex = useMemo(() => {
    return categories?.map((category) => ({
      name: category.name,
      slug: category.slug,
    }))
  }, [categories])

  return (
    <div className="page article-page">
      <TopBar />
      <SiteHeader />
      <main className="article-main">
        {post ? (
          <>
            <header className="article-hero">
              <div className="article-hero__media">
                <img src={heroImage} alt={post.title} loading="lazy" />
              </div>
              <div className="article-hero__overlay">
                <p className="article-hero__category">{categoryLabel}</p>
                <h1>{post.title}</h1>
                {post.excerpt ? <p className="article-hero__excerpt">{post.excerpt}</p> : null}
                <div className="article-hero__meta">
                  {post.author ? <span>{post.author}</span> : null}
                  <span>{activityDate || publishedDate}</span>
                  {activityLocation ? (
                    <span className="article-hero__meta-chip">{activityLocation}</span>
                  ) : null}
                </div>
              </div>
            </header>

            <div className="layout article-layout">
              <article className="article">
                <div className="article-body">
                  <section className="article-body__content">
                    <div dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || '' }} />

                    {activityDetails.length ? (
                      <aside className="article-body__details">
                        <h2>Logística del encuentro</h2>
                        <ul>
                          {activityDetails.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </aside>
                    ) : null}

                    <footer className="article-body__footer">
                      <Link to={footerLink}>{footerLabel}</Link>
                    </footer>
                  </section>

                  <aside className="article-body__sidebar">
                    <section className="article-sidebar__card">
                      <h2>Autor</h2>
                      <div className="article-sidebar__author-block">
                        {post.author ? <AuthorPill name={post.author} /> : <p className="article-sidebar__author-desc">Autor no asignado</p>}

                      </div>
                    </section>

                    {recentPosts.length ? (
                      <section className="article-sidebar__card">
                        <h2>Notas recientes</h2>
                        <ul className="article-sidebar__list">
                          {recentPosts.map((item) => (
                            <li key={item.id} className="article-sidebar__list-item">
                              <Link to={`/article/${item.slug}`} className="article-sidebar__list-link">
                                <img
                                  className="article-sidebar__thumb"
                                  src={item.image || FALLBACK_IMAGE}
                                  alt={item.title}
                                  loading="lazy"
                                />
                                <div className="article-sidebar__list-copy">
                                  <p className="article-sidebar__list-title">{item.title}</p>
                                  <span className="article-sidebar__list-date">{formatDate(item.publishedAt)}</span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {categoryIndex?.length ? (
                      <section className="article-sidebar__card">
                        <h2>Categorias</h2>
                        <ul className="article-sidebar__tags">
                          {categoryIndex.map((category) => (
                            <li key={category.slug}>
                              <Link to={`/category/${category.slug}`}>{category.name}</Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}
                  </aside>
                </div>
              </article>
            </div>
          </>
        ) : (
          <div className="layout">
            <section className="empty-state">
              <h1>Artículo no encontrado</h1>
              <p>
                El contenido que buscas ya no está disponible. Regresa a la{' '}
                <Link to="/">portada principal</Link> para seguir explorando Diván Japonés.
              </p>
            </section>
          </div>
        )}
      </main>
      <div className="layout" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <TrendingPostsSection />
      </div>
      <SiteFooter />
    </div>
  )
}
