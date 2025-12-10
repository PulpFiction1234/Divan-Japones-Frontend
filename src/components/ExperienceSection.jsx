import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'
import formatCategoryLabel from '../utils/formatCategoryLabel'
import { FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'

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

export default function ActivitiesSection() {
  const { publishedActivities } = usePosts()

  const upcomingActivities = useMemo(() => {
    return [...publishedActivities]
      .sort((a, b) => {
        const first = a.scheduledAt ? new Date(a.scheduledAt).getTime() : new Date(a.publishedAt || 0).getTime()
        const second = b.scheduledAt ? new Date(b.scheduledAt).getTime() : new Date(b.publishedAt || 0).getTime()
        return first - second
      })
      .slice(0, 6)
  }, [publishedActivities])

  if (!upcomingActivities.length) {
    return null
  }

  return (
    <section className="activities" id="activities">
      <h2 className="section-heading">Próximas actividades</h2>
      {/* Use activities__list modifier for compact list layout on home */}
      <div className="activities__grid activities__list">
        {upcomingActivities.map((activity) => {
          const eventDate = formatDate(activity.scheduledAt || activity.publishedAt)
          const priceLabel = activity.price?.trim()
          const locationLabel = activity.location?.trim() || 'Lugar por confirmar'

          return (
            <article key={activity.id} className="activity-card">
              <Link to={`/article/${activity.slug}`} className="activity-card__link" aria-label={`Ver detalles de ${activity.title}`}>
                <div className="activity-card__media">
                  <img src={activity.image || FALLBACK_IMAGE} alt={activity.title} loading="lazy" />
                </div>
                <div className="activity-card__body">
                  <span className="activity-card__category">
                    {formatCategoryLabel(activity, { includeActivityPrefix: true, fallback: 'Actividades' })}
                  </span>
                  <h3>{activity.title}</h3>
                  <div className="activity-card__meta">
                    <span className="activity-card__meta-item activity-card__meta-item--location"><FiMapPin aria-hidden="true" />{locationLabel}</span>
                    <span className="activity-card__meta-item activity-card__meta-item--date"><FiCalendar aria-hidden="true" /><time dateTime={activity.scheduledAt || activity.publishedAt}>{eventDate}</time></span>
                    {priceLabel ? (
                      <span className="activity-card__meta-item activity-card__meta-item--price"><FiDollarSign aria-hidden="true" />{priceLabel}</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
