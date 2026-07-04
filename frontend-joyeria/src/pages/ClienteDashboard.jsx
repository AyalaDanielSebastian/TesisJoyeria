import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/Layout'

export default function ClienteDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout
      title={`Bienvenido, ${user.nombre}`}
      subtitle="Panel del cliente — catálogo y compras (próximamente)"
    >
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <span className="badge text-bg-primary mb-3">Cliente</span>
          <p className="mb-2">
            Has iniciado sesión correctamente como <strong>{user.email}</strong>.
          </p>
          <p className="text-muted mb-0">
            Desde aquí podrás navegar el catálogo de joyas, agregar productos al carrito
            y subir comprobantes de pago (HU-02 y HU-03).
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
