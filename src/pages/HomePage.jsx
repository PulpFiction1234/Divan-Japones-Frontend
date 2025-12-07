import TopBar from '../components/Header'
import SiteHeader from '../components/AboutSection'
import LatestSection from '../components/MenuSection'
import ActivitiesSection from '../components/ExperienceSection'
import TrendingPostsSection from '../components/TrendingPostsSection'
import CategoriesSection from '../components/CategoriesSection'
import SiteFooter from '../components/Footer'

export default function HomePage() {
  return (
    <div className="page">
      <TopBar />
      <SiteHeader />
      <main className="layout">
        <LatestSection />
        <TrendingPostsSection />
        <ActivitiesSection />
        <CategoriesSection />
      </main>
      <SiteFooter />
    </div>
  )
}
