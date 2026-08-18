import { useCallback, useEffect, useState } from 'react'
import {
  actualizarEstadoOrden,
  getOrdenEmpleado,
  getOrdenesEmpleado,
} from '../services/empleadoApi'
import { formatPrice, ESTADOS_ORDEN, imagenUrl } from '../utils/format'
import './OrdenesEmpleadoPanel.css'

const ESTADOS_FINALES = ['AnticipoValidado', 'Aprobada', 'Rechazada', 'Cancelada']

function esImagen(mime) {
  return mime?.startsWith('image/')
}

export default function OrdenesEmpleadoPanel() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [validando, setValidando] = useState(false)
  const [notas, setNotas] = useState('')
  const [montoPagado, setMontoPagado] = useState('')
  const [lightboxUrl, setLightboxUrl] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setOrdenes(await getOrdenesEmpleado())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirDetalle = async (id) => {
    setSelectedId(id)
    setLoadingDetalle(true)
    setError('')
    setSuccess('')
    setNotas('')
    try {
      const d = await getOrdenEmpleado(id)
      setDetalle(d)
      const sugerido = Math.round((d.total * 0.5) * 100) / 100
      setMontoPagado(String(sugerido))
    } catch (err) {
      setError(err.message)
      setDetalle(null)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const cerrarDetalle = () => {
    setSelectedId(null)
    setDetalle(null)
    setNotas('')
  }

  const handleValidar = async (estado) => {
    if (!detalle || validando) return
    if (ESTADOS_FINALES.includes(detalle.estado)) return

    setValidando(true)
    setError('')
    setSuccess('')
    try {
      const monto = estado === 'AnticipoValidado' ? parseFloat(montoPagado) : null
      if (estado === 'AnticipoValidado' && (Number.isNaN(monto) || monto <= 0)) {
        setError('Indica un monto de anticipo válido.')
        setValidando(false)
        return
      }

      const actualizada = await actualizarEstadoOrden(detalle.id, estado, notas, monto)
      setDetalle(actualizada)
      setOrdenes((prev) =>
        prev.map((o) => (o.id === actualizada.id
          ? {
              ...o,
              estado: actualizada.estado,
              montoPagado: actualizada.montoPagado,
              saldoPendiente: actualizada.saldoPendiente,
            }
          : o))
      )
      setSuccess(
        estado === 'AnticipoValidado'
          ? `Anticipo validado. Falta por pagar: ${formatPrice(actualizada.saldoPendiente)}.`
          : 'Orden rechazada.'
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setValidando(false)
    }
  }

  const yaVerificada = detalle && ESTADOS_FINALES.includes(detalle.estado)
  const puedeValidar = detalle?.estado === 'PendienteVerificacion' && !validando

  return (
    <div className="ordenes-empleado">
      <div className="ordenes-empleado-header">
        <h2 className="section-title h4 mb-0">Pedidos entrantes</h2>
        <button type="button" className="btn btn-outline-light btn-sm" onClick={cargar}>
          Actualizar
        </button>
      </div>

      {error && !selectedId && <div className="alert alert-danger mt-3">{error}</div>}

      {loading ? (
        <p className="text-muted mt-4">Cargando pedidos...</p>
      ) : ordenes.length === 0 ? (
        <p className="text-muted mt-4">No hay pedidos registrados.</p>
      ) : (
        <div className="admin-table-wrap card-brand mt-4">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Falta pagar</th>
                <th>Comprobante</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id} className={o.estado === 'PendienteVerificacion' ? 'orden-pendiente' : ''}>
                  <td>#{o.id}</td>
                  <td>
                    <span className="admin-name">{o.clienteNombre}</span>
                    <br />
                    <small className="text-muted">{o.clienteEmail}</small>
                  </td>
                  <td className="admin-date">
                    {new Date(o.fechaCreacion).toLocaleString('es-EC')}
                  </td>
                  <td className="text-gold">{formatPrice(o.total)}</td>
                  <td>{formatPrice(o.saldoPendiente ?? o.total)}</td>
                  <td>{o.tieneComprobante ? 'Sí' : 'No'}</td>
                  <td>
                    <span className={`orden-estado orden-estado--${o.estado.toLowerCase()}`}>
                      {ESTADOS_ORDEN[o.estado] ?? o.estado}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={() => abrirDetalle(o.id)}
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && (
        <div className="pm-modal-overlay" onClick={cerrarDetalle}>
          <div className="orden-detalle-modal card-brand" onClick={(e) => e.stopPropagation()}>
            {loadingDetalle ? (
              <p className="text-muted">Cargando detalle...</p>
            ) : detalle ? (
              <>
                <div className="orden-detalle-header">
                  <h3 className="auth-title mb-0">Orden #{detalle.id}</h3>
                  <button type="button" className="navbar-logout" onClick={cerrarDetalle}>Cerrar</button>
                </div>

                {error && <div className="alert alert-danger mt-3">{error}</div>}
                {success && <div className="alert alert-success mt-3">{success}</div>}

                <div className="orden-detalle-grid mt-4">
                  <div>
                    <p className="label-caps mb-1">Cliente</p>
                    <p className="mb-1">{detalle.clienteNombre}</p>
                    <p className="text-muted small">{detalle.clienteEmail}</p>

                    <p className="label-caps mb-1 mt-3">Envío</p>
                    {detalle.envio ? (
                      <>
                        <p className="mb-1">{detalle.envio.nombre}</p>
                        <p className="text-muted small mb-0">{detalle.envio.telefono}</p>
                        <p className="text-muted small mb-0">{detalle.envio.direccion}</p>
                        <p className="text-muted small mb-0">{detalle.envio.ciudad}</p>
                        {detalle.envio.referencia && (
                          <p className="text-muted small mb-0">Ref: {detalle.envio.referencia}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted small">Sin datos de envío.</p>
                    )}

                    <p className="label-caps mb-1 mt-3">Estado</p>
                    <span className={`orden-estado orden-estado--${detalle.estado.toLowerCase()}`}>
                      {ESTADOS_ORDEN[detalle.estado] ?? detalle.estado}
                    </span>

                    {detalle.fechaVerificacion && (
                      <p className="text-muted small mt-2">
                        Verificado: {new Date(detalle.fechaVerificacion).toLocaleString('es-EC')}
                        {detalle.empleadoVerificadorNombre && ` por ${detalle.empleadoVerificadorNombre}`}
                      </p>
                    )}

                    <p className="label-caps mb-1 mt-3">Total</p>
                    <p className="text-gold mb-1">{formatPrice(detalle.total)}</p>
                    <p className="text-muted small mb-0">Pagado: {formatPrice(detalle.montoPagado ?? 0)}</p>
                    <p className="text-gold small">
                      Falta por pagar: {formatPrice(detalle.saldoPendiente ?? detalle.total)}
                    </p>

                    <p className="label-caps mb-1 mt-3">Items</p>
                    <ul className="orden-items-list">
                      {detalle.detalles.map((d) => (
                        <li key={d.productoId}>
                          {d.productoNombre} × {d.cantidad} — {formatPrice(d.subtotal)}
                          {d.notasPersonalizacion && (
                            <small className="d-block text-muted">{d.notasPersonalizacion}</small>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="label-caps mb-2">Comprobante de depósito</p>
                    {detalle.comprobanteUrl ? (
                      <div className="comprobante-viewer">
                        {esImagen(detalle.comprobanteMime) ? (
                          <>
                            <button
                              type="button"
                              className="comprobante-thumb-btn"
                              onClick={() => setLightboxUrl(imagenUrl(detalle.comprobanteUrl))}
                              title="Ampliar imagen"
                            >
                              <img
                                src={imagenUrl(detalle.comprobanteUrl)}
                                alt="Comprobante"
                                className="comprobante-thumb"
                              />
                              <span className="comprobante-zoom-hint">Click para ampliar</span>
                            </button>
                          </>
                        ) : (
                          <a
                            href={imagenUrl(detalle.comprobanteUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-light btn-sm"
                          >
                            Ver PDF — {detalle.comprobanteNombreOriginal}
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted">El cliente aún no ha subido comprobante.</p>
                    )}

                    {!yaVerificada && (
                      <div className="mt-4">
                        <label className="form-label label-caps">Monto de anticipo ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={detalle.total}
                          className="form-control mb-3"
                          value={montoPagado}
                          onChange={(e) => setMontoPagado(e.target.value)}
                          disabled={!puedeValidar}
                        />
                        <small className="text-muted d-block mb-3">
                          Sugerido 50%. Al validar, el saldo pendiente será{' '}
                          {formatPrice(Math.max(0, detalle.total - (parseFloat(montoPagado) || 0)))}.
                        </small>
                        <label className="form-label label-caps">Notas de verificación</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Observaciones opcionales..."
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          maxLength={500}
                          disabled={!puedeValidar}
                        />
                      </div>
                    )}

                    {detalle.notasVerificacion && (
                      <p className="text-muted small mt-3">
                        <strong>Notas:</strong> {detalle.notasVerificacion}
                      </p>
                    )}

                    <div className="orden-acciones mt-4">
                      {yaVerificada ? (
                        <p className="orden-bloqueada text-muted mb-0">
                          Esta orden ya fue verificada. La acción está bloqueada para evitar duplicados.
                        </p>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!puedeValidar || !detalle.comprobanteUrl}
                            onClick={() => handleValidar('AnticipoValidado')}
                          >
                            {validando ? 'Procesando...' : 'Validar anticipo'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-light"
                            disabled={!puedeValidar}
                            onClick={() => handleValidar('Rechazada')}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted">No se pudo cargar la orden.</p>
            )}
          </div>
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
            alt="Comprobante ampliado"
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
