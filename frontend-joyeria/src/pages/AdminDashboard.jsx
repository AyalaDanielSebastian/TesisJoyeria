import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/Layout'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout
      title="Panel de administración"
      subtitle={`Sesión activa: ${user.nombre}`}
    >
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <span className="badge text-bg-danger mb-3">Administrador</span>
          <p className="mb-2">
            Acceso exclusivo para <strong>{user.email}</strong>.
          </p>
          <p className="text-muted mb-0">
            Desde este panel podrás gestionar usuarios, asignar roles
            (Administrador, Empleado, Cliente) y controlar la seguridad interna (HU-06).
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
