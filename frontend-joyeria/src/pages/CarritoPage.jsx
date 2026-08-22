import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import {
  getCarrito,
  removeFromCarrito,
  updateCarritoItem,
} from '../services/carritoApi'
import { crearOrdenDesdeCarrito, subirComprobante } from '../services/ordenApi'
import { formatPrice, imagenUrl } from '../utils/format'
import './CarritoPage.css'

const IMPUESTO = 0.15
const ENVIO_KEY = 'joyeria_envio'

const ENVIO_VACIO = {
  nombre: '',
  telefono: '',
  direccion: '',
  ciudad: 'Quito',
  referencia: '',
}

function cargarEnvioGuardado(nombreUsuario) {
  try {
    const raw = localStorage.getItem(ENVIO_KEY)
    const saved = raw ? JSON.parse(raw) : {}
    return {
      ...ENVIO_VACIO,
      ...saved,
      nombre: saved.nombre || nombreUsuario || '',
      ciudad: saved.ciudad || 'Quito',
    }
  } catch {
    return { ...ENVIO_VACIO, nombre: nombreUsuario || '' }
  }
}

export default function CarritoPage() {
  const { user } = useAuth()
  const [carrito, setCarrito] = useState(null)
  const [seleccionados, setSeleccionados] = useState(() => new Set())
  const [envio, setEnvio] = useState(() => cargarEnvioGuardado(user?.nombre))
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ordenCreada, setOrdenCreada] = useState(null)
  const [comprobante, setComprobante] = useState(null)
  const [confirmando, setConfirmando] = useState(false)

  const [faltaComprobante, setFaltaComprobante] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCarrito()
      setCarrito(data)
      setSeleccionados(new Set((data.items ?? []).map((item) => item.id)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const items = carrito?.items ?? []
  const itemsOrden = useMemo(
    () => items.filter((item) => seleccionados.has(item.id)),
    [items, seleccionados]
  )

  const resumen = useMemo(() => {
    const subtotal = itemsOrden.reduce((acc, item) => acc + item.subtotal, 0)
    const impuesto = Math.round(subtotal * IMPUESTO * 100) / 100
    return { subtotal, impuesto, total: subtotal + impuesto }
  }, [itemsOrden])

  const todosSeleccionados = items.length > 0 && itemsOrden.length === items.length

  const handleCantidad = async (item, cantidad) => {
    if (cantidad < 1 || cantidad > item.stockDisponible || cantidad === item.cantidad) return
    setError('')
    setUpdatingId(item.id)
    try {
      setCarrito(await updateCarritoItem(item.id, cantidad, {
        metal: item.metal,
        talla: item.talla,
        grabado: item.grabado,
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleEliminar = async (itemId) => {
    setError('')
    try {
      const data = await removeFromCarrito(itemId)
      setCarrito(data)
      setSeleccionados((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleItem = (itemId) => {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const toggleTodos = () => {
    if (todosSeleccionados) setSeleccionados(new Set())
    else setSeleccionados(new Set(items.map((item) => item.id)))
  }

  const setCampoEnvio = (campo, valor) => {
    setEnvio((prev) => ({ ...prev, [campo]: valor }))
  }

  const validarEnvio = () => {
    if (envio.nombre.trim().length < 3) return 'Indica el nombre de quien recibe el pedido.'
    if (envio.telefono.trim().length < 7) return 'Indica un teléfono de contacto para el envío.'
    if (envio.direccion.trim().length < 5) return 'Indica la dirección de envío.'
    if (envio.ciudad.trim().length < 2) return 'Indica la ciudad de envío.'
    return null
  }

  const handleCheckout = async () => {
    if (itemsOrden.length === 0) {
      setError('Marca al menos una pieza para incluirla en la orden.')
      return
    }
    const errorEnvio = validarEnvio()
    if (errorEnvio) {
      setError(errorEnvio)
      return
    }
    if (!comprobante) {
      setFaltaComprobante(true)
      setError('Debes subir la captura de tu transferencia (anticipo del 50%) para finalizar la compra.')
      document.getElementById('comprobante')?.focus()
      return
    }
    setFaltaComprobante(false)
    setError('')
    setConfirmando(true)
    let orden = null
    try {
      localStorage.setItem(ENVIO_KEY, JSON.stringify(envio))
      orden = await crearOrdenDesdeCarrito(itemsOrden.map((item) => item.id), envio)
      const restante = await getCarrito()
      setCarrito(restante)
      setSeleccionados(new Set((restante.items ?? []).map((item) => item.id)))
      await subirComprobante(orden.id, comprobante)
      setOrdenCreada(orden)
      setComprobante(null)
      setSuccess(`Pedido #${orden.id} formalizado. El vendedor revisará tu comprobante.`)
    } catch (err) {
      if (orden) {
        setOrdenCreada(orden)
        setError('El pedido se creó, pero el comprobante no se subió. Adjúntalo otra vez aquí o en Mis órdenes.')
      } else {
        setError(err.message)
      }
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <DashboardLayout title="Mi carrito" subtitle="Datos de envío y anticipo del 50% para formalizar el pedido">
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {ordenCreada && (
        <div className="card-brand dashboard-card mb-4">
          <h3 className="auth-title h5">Pedido #{ordenCreada.id} formalizado — {formatPrice(ordenCreada.total)}</h3>
          <p className="text-muted mb-1">
            Anticipo 50%: {formatPrice(Math.round(ordenCreada.total * 0.5 * 100) / 100)}.
            Falta por pagar: {formatPrice(ordenCreada.saldoPendiente ?? ordenCreada.total)}.
          </p>
          {ordenCreada.envio && (
            <p className="text-muted small mb-0">
              Envío a {ordenCreada.envio.nombre}, {ordenCreada.envio.direccion}, {ordenCreada.envio.ciudad}.
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Cargando carrito...</p>
      ) : items.length === 0 ? (
        <div className="card-brand dashboard-card">
          <p className="mb-3">Tu carrito está vacío.</p>
          <Link to="/tienda" className="btn btn-primary">Ir a la tienda</Link>
        </div>
      ) : (
        <>
          <div className="cart-toolbar">
            <label className="cart-select-all">
              <input
                type="checkbox"
                checked={todosSeleccionados}
                onChange={toggleTodos}
              />
              <span>
                {todosSeleccionados ? 'Quitar todas de la orden' : 'Incluir todas en la orden'}
              </span>
            </label>
            <p className="cart-toolbar-hint">
              {itemsOrden.length} de {items.length} pieza{items.length === 1 ? '' : 's'} para esta orden.
              Las no marcadas se quedan en el carrito.
            </p>
          </div>

          <div className="cart-items">
            {items.map((item) => {
              const incluido = seleccionados.has(item.id)
              return (
                <div
                  key={item.id}
                  className={`cart-item card-brand${incluido ? '' : ' cart-item--excluded'}`}
                >
                  <label className="cart-check" title="Incluir en esta orden">
                    <input
                      type="checkbox"
                      checked={incluido}
                      onChange={() => toggleItem(item.id)}
                    />
                  </label>
                  <img src={imagenUrl(item.imagenUrl)} alt="" className="cart-item-img" />
                  <div className="cart-item-info flex-grow-1">
                    <h3 className="product-card-name">{item.productoNombre}</h3>
                    <p className="text-gold mb-2">{formatPrice(item.precioUnitario)} c/u</p>
                    {(item.metal || item.talla || item.grabado || item.notasPersonalizacion) && (
                      <p className="cart-notas">
                        <strong>Personalización:</strong>{' '}
                        {item.notasPersonalizacion || [
                          item.metal && `Metal: ${item.metal}`,
                          item.talla && `Talla: ${item.talla}`,
                          item.grabado && `Grabado: "${item.grabado}"`,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className={`cart-incluido-label${incluido ? ' is-on' : ''}`}>
                      {incluido ? 'Va en esta orden' : 'Se queda en el carrito'}
                    </p>
                    <div className="cart-item-actions">
                      <div className="cart-qty-stepper">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          disabled={updatingId === item.id || item.cantidad <= 1}
                          onClick={() => handleCantidad(item, item.cantidad - 1)}
                          aria-label="Quitar una unidad"
                        >
                          −
                        </button>
                        <span className="cart-qty-value">{item.cantidad}</span>
                        <button
                          type="button"
                          className="cart-qty-btn"
                          disabled={updatingId === item.id || item.cantidad >= item.stockDisponible}
                          onClick={() => handleCantidad(item, item.cantidad + 1)}
                          aria-label="Agregar una unidad"
                        >
                          +
                        </button>
                      </div>
                      <button type="button" className="navbar-logout" onClick={() => handleEliminar(item.id)}>
                        Quitar del carrito
                      </button>
                    </div>
                  </div>
                  <p className="text-gold cart-subtotal">{formatPrice(item.subtotal)}</p>
                </div>
              )
            })}
          </div>

          <div className="cart-checkout">
            <div className="cart-envio card-brand">
              <h3 className="auth-title h5 mb-2">Datos de envío</h3>
              <p className="text-muted small mb-3">
                Indica a dónde llega este pedido. El anticipo que pagas ya incluye el costo de envío;
                este beneficio aplica para entregas en Quito.
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="envio-nombre">Nombre de quien recibe</label>
                  <input
                    id="envio-nombre"
                    className="form-control"
                    value={envio.nombre}
                    onChange={(e) => setCampoEnvio('nombre', e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="envio-telefono">Teléfono</label>
                  <input
                    id="envio-telefono"
                    className="form-control"
                    value={envio.telefono}
                    onChange={(e) => setCampoEnvio('telefono', e.target.value)}
                    autoComplete="tel"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="envio-direccion">Dirección</label>
                  <input
                    id="envio-direccion"
                    className="form-control"
                    value={envio.direccion}
                    onChange={(e) => setCampoEnvio('direccion', e.target.value)}
                    autoComplete="street-address"
                    placeholder="Calle, número, sector..."
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="envio-ciudad">Ciudad</label>
                  <input
                    id="envio-ciudad"
                    className="form-control"
                    value={envio.ciudad}
                    onChange={(e) => setCampoEnvio('ciudad', e.target.value)}
                    autoComplete="address-level2"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="envio-referencia">Referencia (opcional)</label>
                  <input
                    id="envio-referencia"
                    className="form-control"
                    value={envio.referencia}
                    onChange={(e) => setCampoEnvio('referencia', e.target.value)}
                    placeholder="Casa color blanco, junto al parque..."
                  />
                </div>
              </div>
            </div>

            <div className="cart-summary card-brand">
              <div className="cart-summary-row">
                <span>Piezas en esta orden</span>
                <span>{itemsOrden.length}</span>
              </div>
              <div className="cart-summary-row"><span>Subtotal</span><span>{formatPrice(resumen.subtotal)}</span></div>
              <div className="cart-summary-row"><span>Impuesto (15%)</span><span>{formatPrice(resumen.impuesto)}</span></div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span><span className="text-gold">{formatPrice(resumen.total)}</span>
              </div>
              <p className="cart-anticipo">
                Anticipo a transferir (50%): {formatPrice(Math.round(resumen.total * 0.5 * 100) / 100)}
              </p>
              <p className="text-muted small mb-0">
                El anticipo incluye el envío dentro de Quito.
              </p>
              <label className="form-label label-caps mt-3" htmlFor="comprobante">
                Comprobante de transferencia <span className="text-gold">*</span>
              </label>
              <input
                id="comprobante"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className={`form-control${faltaComprobante ? ' is-invalid' : ''}`}
                required
                onChange={(e) => {
                  setComprobante(e.target.files?.[0] ?? null)
                  setFaltaComprobante(false)
                  setError('')
                }}
              />
              {faltaComprobante && (
                <small className="text-danger d-block mt-2">
                  Adjunta el comprobante para poder finalizar.
                </small>
              )}
              <small className="text-muted d-block mt-2">
                Obligatorio. Sube una captura JPG, PNG o PDF del depósito del 50%.
              </small>
              {comprobante && (
                <p className="text-gold small mt-2 mb-0">Archivo: {comprobante.name}</p>
              )}
              <button
                type="button"
                className="btn btn-primary w-100 mt-3"
                onClick={handleCheckout}
                disabled={confirmando || itemsOrden.length === 0 || !comprobante}
              >
                {confirmando
                  ? 'Formalizando...'
                  : itemsOrden.length === 0
                    ? 'Selecciona piezas para la orden'
                    : !comprobante
                      ? 'Sube el comprobante para finalizar'
                      : 'Formalizar pedido'}
              </button>
              {items.length > itemsOrden.length && (
                <p className="cart-summary-note">
                  {items.length - itemsOrden.length} pieza{(items.length - itemsOrden.length) === 1 ? '' : 's'} quedará
                  en el carrito para después.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <p className="mt-4">
        <Link to="/cliente/ordenes" className="text-gold">Ver mis órdenes →</Link>
      </p>
    </DashboardLayout>
  )
}
