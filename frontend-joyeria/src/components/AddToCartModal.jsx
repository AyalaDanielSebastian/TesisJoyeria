import { useState } from 'react'
import { addToCarrito } from '../services/carritoApi'
import { formatPrice, imagenUrl } from '../utils/format'
import './AddToCartModal.css'

export default function AddToCartModal({ producto, onClose, onAdded }) {
  const [cantidad, setCantidad] = useState(1)
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await addToCarrito(producto.id, cantidad, notas)
      onAdded?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pm-modal-overlay" onClick={onClose}>
      <div className="add-cart-modal card-brand" onClick={(e) => e.stopPropagation()}>
        <div className="add-cart-header">
          <img src={imagenUrl(producto.imagenUrl)} alt={producto.nombre} className="add-cart-img" />
          <div>
            <h3 className="auth-title mb-1">{producto.nombre}</h3>
            <p className="text-gold mb-0">{formatPrice(producto.precio)}</p>
            <p className="text-muted small mb-0">Stock: {producto.stock}</p>
          </div>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3">
            <label className="form-label">Cantidad</label>
            <input type="number" min="1" max={producto.stock} className="form-control"
              value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value, 10))} required />
          </div>

          {producto.permitePersonalizacion && (
            <div className="mb-4">
              <label className="form-label">Personalización</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Ej: Grabado 'María', talla 7, oro amarillo 18k..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                maxLength={500}
              />
              <small className="text-muted">Indica grabado, talla, metal o instrucciones especiales.</small>
            </div>
          )}

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary flex-grow-1" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar al carrito'}
            </button>
            <button type="button" className="btn btn-outline-light" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
