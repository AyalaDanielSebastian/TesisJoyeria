import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/Layout'

export default function ClienteDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout
      title={`Bienvenido, ${user.nombre}`}
      subtitle="Tu espacio de compras"
    >
      <div className="cliente-actions">
        <Link to="/tienda" className="cliente-action-card card-brand">
          <span className="badge-gold mb-2 d-inline-block">Tienda</span>
          <h3 className="auth-title h5">Explorar joyas</h3>
          <p className="text-muted mb-0">Navega el catálogo y personaliza tus piezas.</p>
        </Link>
        <Link to="/cliente/carrito" className="cliente-action-card card-brand">
          <span className="badge-gold mb-2 d-inline-block">Carrito</span>
          <h3 className="auth-title h5">Mi carrito</h3>
          <p className="text-muted mb-0">Revisa tus selecciones y confirma tu orden.</p>
        </Link>
        <Link to="/cliente/ordenes" className="cliente-action-card card-brand">
          <span className="badge-outline mb-2 d-inline-block">Órdenes</span>
          <h3 className="auth-title h5">Mis órdenes</h3>
          <p className="text-muted mb-0">Consulta el estado de tus compras y pagos.</p>
        </Link>
      </div>
    </DashboardLayout>
  )
}
