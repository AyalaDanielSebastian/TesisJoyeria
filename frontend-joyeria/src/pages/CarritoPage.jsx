import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import {
  getCarrito,
  removeFromCarrito,
  updateCarritoItem,
} from '../services/carritoApi'
import { crearOrdenDesdeCarrito, subirComprobante } from '../services/ordenApi'
import { formatPrice, imagenUrl } from '../utils/format'
import './CarritoPage.css'

export default function CarritoPage() {
  const [carrito, setCarrito] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ordenCreada, setOrdenCreada] = useState(null)
  const [comprobante, setComprobante] = useState(null)
  const [subiendo, setSubiendo] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      setCarrito(await getCarrito())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleCantidad = async (item, cantidad) => {
    try {
      setCarrito(await updateCarritoItem(item.id, cantidad, {
        metal: item.metal,
        talla: item.talla,
        grabado: item.grabado,
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEliminar = async (itemId) => {
    try {
      setCarrito(await removeFromCarrito(itemId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCheckout = async () => {
    setError('')
    try {
      const orden = await crearOrdenDesdeCarrito()
      setOrdenCreada(orden)
      setSuccess(`Orden #${orden.id} creada. Sube tu comprobante de pago.`)
      setCarrito({ items: [], subtotal: 0, impuesto: 0, total: 0 })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleComprobante = async (e) => {
    e.preventDefault()
    if (!comprobante || !ordenCreada) return
    setSubiendo(true)
    setError('')
    try {
      await subirComprobante(ordenCreada.id, comprobante)
      setSuccess('Comprobante subido. Tu orden está pendiente de verificación.')
      setOrdenCreada(null)
      setComprobante(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <DashboardLayout title="Mi carrito" subtitle="Revisa tus piezas y personalizaciones">
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {ordenCreada && (
        <div className="card-brand dashboard-card mb-4">
          <h3 className="auth-title h5">Orden #{ordenCreada.id} — {formatPrice(ordenCreada.total)}</h3>
          <p className="text-muted mb-1">
            Anticipo sugerido (50%): {formatPrice(Math.round(ordenCreada.total * 0.5 * 100) / 100)}
          </p>
          <p className="text-gold small mb-3">
            Falta por pagar: {formatPrice(ordenCreada.saldoPendiente ?? ordenCreada.total)}
          </p>
          <p className="text-muted">Sube tu comprobante de transferencia (JPG, PNG o PDF).</p>
          <form onSubmit={handleComprobante} className="d-flex flex-wrap gap-2 align-items-end">
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="form-control"
              style={{ maxWidth: 320 }} required
              onChange={(e) => setComprobante(e.target.files?.[0] ?? null)} />
            <button type="submit" className="btn btn-primary" disabled={subiendo}>
              {subiendo ? 'Subiendo...' : 'Enviar comprobante'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-muted">Cargando carrito...</p>
      ) : carrito?.items?.length === 0 ? (
        <div className="card-brand dashboard-card">
          <p className="mb-3">Tu carrito está vacío.</p>
          <Link to="/tienda" className="btn btn-primary">Ir a la tienda</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {carrito.items.map((item) => (
              <div key={item.id} className="cart-item card-brand">
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
                  <div className="d-flex gap-2 align-items-center mt-2">
                    <label className="form-label mb-0 me-1">Cant.</label>
                    <input type="number" min="1" max={item.stockDisponible}
                      className="form-control form-control-sm cart-qty"
                      defaultValue={item.cantidad}
                      onBlur={(e) => handleCantidad(item, parseInt(e.target.value, 10))} />
                    <button type="button" className="navbar-logout" onClick={() => handleEliminar(item.id)}>
                      Quitar
                    </button>
                  </div>
                </div>
                <p className="text-gold cart-subtotal">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="cart-summary card-brand">
            <div className="cart-summary-row"><span>Subtotal</span><span>{formatPrice(carrito.subtotal)}</span></div>
            <div className="cart-summary-row"><span>Impuesto (15%)</span><span>{formatPrice(carrito.impuesto)}</span></div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span><span className="text-gold">{formatPrice(carrito.total)}</span>
            </div>
            <button type="button" className="btn btn-primary w-100 mt-3" onClick={handleCheckout}>
              Confirmar orden
            </button>
          </div>
        </>
      )}

      <p className="mt-4">
        <Link to="/cliente/ordenes" className="text-gold">Ver mis órdenes →</Link>
      </p>
    </DashboardLayout>
  )
}
