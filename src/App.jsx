import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
// Temporarily disabled global App.css to test component-level styles
// import './App.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ArticlePage = lazy(() => import('./pages/ArticlePage'))
const PublicationsPage = lazy(() => import('./pages/PublicationsPage'))
const MagazinePage = lazy(() => import('./pages/MagazinePage'))
const MagazineDetailPage = lazy(() => import('./pages/MagazineDetailPage'))
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="page-loader" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background, #f5f0eb)'
    }}>
      <div className="loader-spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(0,0,0,0.1)',
        borderTopColor: 'var(--color-primary, #111)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/publicaciones" element={<PublicationsPage />} />
          <Route path="/revista/:magazineId" element={<MagazineDetailPage />} />
          <Route path="/revista" element={<MagazinePage />} />
          <Route path="/actividades" element={<ActivitiesPage />} />
          <Route path="/quienes-somos" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/terminos-y-condiciones" element={<TermsPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/article/:postId" element={<ArticlePage />} />
          <Route path="/buscar" element={<SearchPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App
