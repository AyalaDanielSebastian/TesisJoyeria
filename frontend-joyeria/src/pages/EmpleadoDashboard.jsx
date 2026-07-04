import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/Layout'

export default function EmpleadoDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout
      title={`Panel de empleado`}
      subtitle={`Hola, ${user.nombre} — gestión operativa (próximamente)`}
    >
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <span className="badge text-bg-warning text-dark mb-3">Empleado</span>
          <p className="mb-2">
            Acceso autorizado para <strong>{user.email}</strong>.
          </p>
          <p className="text-muted mb-0">
            Aquí podrás ver órdenes pendientes, validar comprobantes de pago
            y actualizar el inventario del catálogo (HU-04 y HU-05).
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
