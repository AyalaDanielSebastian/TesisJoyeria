import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-dark">Joyería</h1>
              <p className="text-muted mb-0">{title}</p>
              {subtitle && <small className="text-muted">{subtitle}</small>}
            </div>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">{children}</div>
            </div>
            <p className="text-center text-muted small mt-3 mb-0">
              Plataforma e-commerce · Tesis
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ text, linkText, to }) {
  return (
    <p className="text-center mt-3 mb-0 small">
      {text}{' '}
      <Link to={to} className="text-decoration-none">
        {linkText}
      </Link>
    </p>
  )
}

export function DashboardLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand fw-semibold">Joyería</span>
          <div className="d-flex align-items-center gap-3">
            <span className="badge text-bg-secondary">{user.rol}</span>
            <span className="text-white-50 small d-none d-sm-inline">{user.nombre}</span>
            <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-5">
        <div className="mb-4">
          <h1 className="h3 fw-bold">{title}</h1>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  )
}
