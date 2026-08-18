import { useState } from 'react'
import { DashboardLayout } from '../components/Layout'
import ProductManager from '../components/ProductManager'
import OrdenesEmpleadoPanel from '../components/OrdenesEmpleadoPanel'

export default function EmpleadoDashboard() {
  const [tab, setTab] = useState('pedidos')

  return (
    <DashboardLayout
      title="Panel de empleado"
      subtitle="Verificación de pedidos y consulta de catálogo"
    >
      <div className="admin-tabs mb-4">
        <button
          type="button"
          className={`admin-tab${tab === 'pedidos' ? ' active' : ''}`}
          onClick={() => setTab('pedidos')}
        >
          Pedidos
        </button>
        <button
          type="button"
          className={`admin-tab${tab === 'catalogo' ? ' active' : ''}`}
          onClick={() => setTab('catalogo')}
        >
          Catálogo
        </button>
      </div>

      {tab === 'pedidos' ? (
        <>
          <div className="dashboard-info card-brand dashboard-card mb-4">
            <span className="badge-outline mb-2 d-inline-block">Vendedor</span>
            <p className="mb-0 text-muted">
              Revisa los pedidos entrantes, amplía el comprobante de depósito y valida el anticipo.
              Una vez verificada, la orden queda bloqueada para evitar acciones duplicadas.
            </p>
          </div>
          <OrdenesEmpleadoPanel />
        </>
      ) : (
        <>
          <div className="dashboard-info card-brand dashboard-card mb-4">
            <span className="badge-outline mb-2 d-inline-block">Inventario</span>
            <p className="mb-0 text-muted">
              Consulta el catálogo activo. Crear, editar o desactivar joyas solo lo puede hacer el administrador.
            </p>
          </div>
          <ProductManager />
        </>
      )}
    </DashboardLayout>
  )
}
