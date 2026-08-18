import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import { getMisOrdenes, subirComprobante } from '../services/ordenApi'
import { formatPrice, ESTADOS_ORDEN } from '../utils/format'
import '../pages/AdminDashboard.css'

function estadoHint(estado) {
  switch (estado) {
    case 'PendientePago':
      return 'Sube tu comprobante de depósito para que el vendedor lo revise.'
    case 'PendienteVerificacion':
      return 'El vendedor está revisando tu comprobante. Aún no está validado.'
    case 'AnticipoValidado':
      return 'El vendedor ya validó el anticipo. Queda el saldo pendiente.'
    case 'Aprobada':
      return 'Compra confirmada.'
    case 'Rechazada':
      return 'El comprobante fue rechazado. Contacta a la tienda.'
    default:
      return ''
  }
}

export default function MisOrdenesPage() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [subiendoId, setSubiendoId] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setOrdenes(await getMisOrdenes())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleComprobante = async (ordenId, file) => {
    if (!file) return
    setSubiendoId(ordenId)
    setError('')
    setSuccess('')
    try {
      await subirComprobante(ordenId, file)
      setSuccess('Comprobante enviado. El vendedor lo verificará.')
      await cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendoId(null)
    }
  }

  return (
    <DashboardLayout title="Mis órdenes" subtitle="Historial de compras, verificación del vendedor y saldos">
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : ordenes.length === 0 ? (
        <div className="card-brand dashboard-card">
          <p>Aún no tienes compras. Cuando confirmes una orden desde el carrito, aparecerá aquí con su estado.</p>
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
                <th></th>
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
                  <td>
                    <span className={`orden-estado orden-estado--${(o.estado || '').toLowerCase()}`}>
                      {ESTADOS_ORDEN[o.estado] ?? o.estado}
                    </span>
                    {estadoHint(o.estado) && (
                      <small className="d-block text-muted mt-1">{estadoHint(o.estado)}</small>
                    )}
                  </td>
                  <td>
                    {(o.estado === 'PendientePago' || o.estado === 'PendienteVerificacion') && (
                      <label className="btn btn-outline-light btn-sm mb-0">
                        {subiendoId === o.id ? 'Enviando...' : 'Subir comprobante'}
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          hidden
                          disabled={subiendoId === o.id}
                          onChange={(e) => handleComprobante(o.id, e.target.files?.[0])}
                        />
                      </label>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
