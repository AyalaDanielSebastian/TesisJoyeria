import { Link, useNavigate } from 'react-router-dom'
import { useAuth, getDashboardPath } from '../context/AuthContext'
import { BRAND_NAME, tiendaUrl } from '../utils/brand'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Colecciones', categoria: null },
  { label: 'Anillos', categoria: 'Anillos' },
  { label: 'Collares', categoria: 'Collares' },
  { label: 'Pendientes', categoria: 'Pendientes' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const panelPath = user ? getDashboardPath(user.rol) : null

  return (
    <header className="navbar-brand-custom fixed-top">
      <div className="container-narrow navbar-inner">
        <Link to="/" className="navbar-logo">
          {BRAND_NAME}
        </Link>

        <nav className="navbar-links d-none d-lg-flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={tiendaUrl(link.categoria)} className="navbar-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {user.rol === 'Cliente' && (
                <>
                  <Link to="/tienda" className="navbar-link d-none d-sm-inline">Tienda</Link>
                  <Link to="/cliente/carrito" className="navbar-shop-link">Carrito</Link>
                </>
              )}
              <Link to={panelPath} className="navbar-shop-link">
                Mi cuenta
              </Link>
              <button type="button" className="navbar-logout" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link d-none d-sm-inline">
                Ingresar
              </Link>
              <Link to="/tienda" className="navbar-shop-link">
                Tienda
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
