import { Route, Routes } from 'react-router-dom'
// Temporarily disabled global App.css to test component-level styles
// import './App.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import CategoryPage from './pages/CategoryPage'
import ArticlePage from './pages/ArticlePage'
import PublicationsPage from './pages/PublicationsPage'
import MagazinePage from './pages/MagazinePage'
import MagazineDetailPage from './pages/MagazineDetailPage'
import ActivitiesPage from './pages/ActivitiesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'

function App() {
  return (
    <AuthProvider>
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
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/article/:postId" element={<ArticlePage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
