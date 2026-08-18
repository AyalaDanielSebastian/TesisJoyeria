import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import { getMisOrdenes } from '../services/ordenApi'
import { formatPrice, ESTADOS_ORDEN } from '../utils/format'

export default function MisOrdenesPage() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    try {
      setOrdenes(await getMisOrdenes())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return (
    <DashboardLayout title="Mis órdenes" subtitle="Historial de compras y saldos pendientes">
      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : ordenes.length === 0 ? (
        <div className="card-brand dashboard-card">
          <p>Aún no tienes órdenes.</p>
          <Link to="/tienda" className="btn btn-primary mt-2">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="admin-table-wrap card-brand">
          <table className="admin-table">
            <thead>
              <tr>
                <th># Orden</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Falta por pagar</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td className="admin-date">{new Date(o.fechaCreacion).toLocaleDateString('es-EC')}</td>
                  <td>{o.cantidadItems}</td>
                  <td className="text-gold">{formatPrice(o.total)}</td>
                  <td>{formatPrice(o.montoPagado ?? 0)}</td>
                  <td className={o.saldoPendiente > 0 ? 'text-gold' : 'text-muted'}>
                    {formatPrice(o.saldoPendiente ?? o.total)}
                  </td>
                  <td>{ESTADOS_ORDEN[o.estado] ?? o.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
