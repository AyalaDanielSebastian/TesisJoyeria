import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import { getMisOrdenes, subirComprobante } from '../services/ordenApi'
import { formatPrice, ESTADOS_ORDEN, imagenUrl } from '../utils/format'
import '../pages/AdminDashboard.css'
import '../components/OrdenesEmpleadoPanel.css'

function estadoHint(orden) {
  switch (orden.estado) {
    case 'PendientePago':
      return (orden.tieneComprobante || orden.comprobanteUrl)
        ? 'Tu comprobante ya está adjunto a esta orden.'
        : 'Sube tu comprobante de depósito para que el vendedor lo revise.'
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

function esImagen(mime, url) {
  if (mime?.startsWith('image/')) return true
  return /\.(jpe?g|png|webp)$/i.test(url || '')
}

export default function MisOrdenesPage() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [subiendoId, setSubiendoId] = useState(null)
  const [lightboxUrl, setLightboxUrl] = useState(null)

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

  const verComprobante = (orden) => {
    const url = imagenUrl(orden.comprobanteUrl)
    if (esImagen(orden.comprobanteMime, orden.comprobanteUrl)) {
      setLightboxUrl(url)
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
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
                <th>Envío</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Falta por pagar</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const yaSubio = Boolean(o.tieneComprobante || o.comprobanteUrl)
                const puedeSubir = o.estado === 'PendientePago' && !yaSubio
                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td className="admin-date">{new Date(o.fechaCreacion).toLocaleDateString('es-EC')}</td>
                    <td>{o.cantidadItems}</td>
                    <td>
                      {o.envio ? (
                        <>
                          <span className="admin-name">{o.envio.nombre}</span>
                          <br />
                          <small className="text-muted">{o.envio.direccion}, {o.envio.ciudad}</small>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-gold">{formatPrice(o.total)}</td>
                    <td>{formatPrice(o.montoPagado ?? 0)}</td>
                    <td className={o.saldoPendiente > 0 ? 'text-gold' : 'text-muted'}>
                      {formatPrice(o.saldoPendiente ?? o.total)}
                    </td>
                    <td>
                      <span className={`orden-estado orden-estado--${(o.estado || '').toLowerCase()}`}>
                        {ESTADOS_ORDEN[o.estado] ?? o.estado}
                      </span>
                      {estadoHint(o) && (
                        <small className="d-block text-muted mt-1">{estadoHint(o)}</small>
                      )}
                    </td>
                    <td>
                      {yaSubio && (
                        <button
                          type="button"
                          className="btn btn-outline-light btn-sm"
                          onClick={() => verComprobante(o)}
                        >
                          Ver comprobante
                        </button>
                      )}
                      {puedeSubir && (
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
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {lightboxUrl && (
        <div className="lightbox-overlay" onClick={() => setLightboxUrl(null)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxUrl(null)}
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            src={lightboxUrl}
            alt="Comprobante"
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DashboardLayout>
  )
}
