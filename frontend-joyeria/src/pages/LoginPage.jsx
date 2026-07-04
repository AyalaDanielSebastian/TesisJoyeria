import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, getDashboardPath } from '../context/AuthContext'
import { login as loginApi } from '../services/authApi'
import AuthLayout, { AuthFooterLink } from '../components/Layout'

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(location.state?.error || '')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user.rol)} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginApi(email, password)
      login(data)
      navigate(getDashboardPath(data.rol))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accede con tu cuenta">
      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <AuthFooterLink text="¿No tienes cuenta?" linkText="Regístrate" to="/register" />

      <div className="mt-4 p-3 bg-light rounded small text-muted">
        <strong>Cuentas de prueba:</strong>
        <ul className="mb-0 mt-1">
          <li>Admin: admin@joyeria.com / Admin123!</li>
          <li>Empleado: empleado@joyeria.com / Empleado123!</li>
          <li>Cliente: regístrate en la plataforma</li>
        </ul>
      </div>
    </AuthLayout>
  )
}
