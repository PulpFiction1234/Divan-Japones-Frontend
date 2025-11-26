import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(username, password)

    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }

  return (
    <>
      <Header />
      <main className="login-page">
        <div className="login-container">
          <h1>Acceso al Panel de Administración</h1>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </main>
      <Footer />

      <style>{`
        .login-page {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-container {
          background: white;
          padding: 3rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        .login-container h1 {
          margin-bottom: 2rem;
          text-align: center;
          color: #333;
          font-size: 1.5rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #555;
        }

        .form-group input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #c41e3a;
        }

        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c00;
          padding: 0.75rem;
          border-radius: 4px;
          text-align: center;
        }

        .btn-primary {
          background-color: #c41e3a;
          color: white;
          padding: 0.875rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #a01828;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}
