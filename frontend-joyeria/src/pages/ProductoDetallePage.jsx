import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getProducto } from '../services/catalogApi'
import { addToCarrito } from '../services/carritoApi'
import { formatPrice, imagenUrl } from '../utils/format'
import '../components/ProductCard.css'
import './ProductoDetallePage.css'

function calcularPrecioLocal(producto, grabado) {
  let precio = producto.precio
  if (producto.permitePersonalizacion && grabado.trim()) {
    precio += producto.recargoGrabado
  }
  return precio
}

function tallasDe(producto) {
  const raw = producto?.tallasDisponibles
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean)
  }
  return String(raw).split(',').map((t) => t.trim()).filter(Boolean)
}

export default function ProductoDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const esCliente = isAuthenticated && user?.rol === 'Cliente'

  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [metal, setMetal] = useState('')
  const [talla, setTalla] = useState('')
  const [grabado, setGrabado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [adding, setAdding] = useState(false)
  const [success, setSuccess] = useState('')

  const cargar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const p = await getProducto(id)
      setProducto(p)
      const defaultMetal = p.metalesDisponibles?.[0]?.nombre ?? p.materialDefault
      setMetal(defaultMetal)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  const precioUnitario = useMemo(
    () => (producto ? calcularPrecioLocal(producto, grabado) : 0),
    [producto, grabado]
  )

  const tallas = tallasDe(producto)
  const esPendientes = /pendientes|aretes/i.test(producto?.categoriaNombre || '')
  const requiereTalla = Boolean(producto?.permitePersonalizacion) && !esPendientes && tallas.length > 0
  const agotada = producto?.stock === 0

  const validarOpciones = () => {
    if (!producto.permitePersonalizacion) return null
    if (!metal) return 'Selecciona un metal.'
    if (requiereTalla && !talla) return 'Selecciona una talla o medida.'
    return null
  }

  const handleAgregar = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validacion = validarOpciones()
    if (validacion) {
      setError(validacion)
      return
    }

    setAdding(true)
    try {
      const personalizacion = producto.permitePersonalizacion
        ? { metal, talla: requiereTalla ? talla : '', grabado }
        : { metal: '', talla: '', grabado: '' }

      await addToCarrito(producto.id, cantidad, personalizacion)
      setSuccess('Pieza agregada al carrito.')
      setTimeout(() => navigate('/cliente/carrito'), 800)
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="home-page">
        <Navbar />
        <section className="section-padding"><p className="text-muted container-narrow">Cargando ficha...</p></section>
        <Footer />
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="home-page">
        <Navbar />
        <section className="section-padding container-narrow">
          <p className="text-muted">{error || 'Producto no encontrado.'}</p>
          <Link to="/tienda" className="btn btn-outline-light mt-3">Volver al catálogo</Link>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="home-page">
      <Navbar />
      <section className="section-padding producto-detalle">
        <div className="container-narrow">
          <Link to="/tienda" className="producto-back text-muted">← Volver al catálogo</Link>

          <div className="producto-detalle-grid">
            <div className="producto-detalle-img-wrap">
              {producto.permitePersonalizacion && !agotada && (
                <span className="badge-gold product-badge">Personalizable</span>
              )}
              {agotada && (
                <span className="badge-agotada">Agotada</span>
              )}
              <img src={imagenUrl(producto.imagenUrl)} alt={producto.nombre} />
            </div>

            <div className="producto-detalle-info">
              <p className="label-caps mb-1">{producto.categoriaNombre}</p>
              <h1 className="section-title h2">{producto.nombre}</h1>
              <p className="text-muted producto-descripcion">{producto.descripcion}</p>

              <div className="producto-precio-box">
                <span className="label-caps">Precio</span>
                <p className="producto-precio-dinamico">{formatPrice(precioUnitario)}</p>
                {grabado.trim() && producto.recargoGrabado > 0 && (
                  <p className="text-muted small mb-0">
                    Precio joya: {formatPrice(producto.precio)} · Grabado: +{formatPrice(producto.recargoGrabado)}
                  </p>
                )}
              </div>

              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {success && <div className="alert alert-success mt-3">{success}</div>}

              {agotada && (
                <div className="alert alert-danger mt-3 mb-0">
                  Esta pieza está agotada. No se puede agregar al carrito.
                </div>
              )}

              <form onSubmit={handleAgregar} className="producto-form mt-4">
                {producto.permitePersonalizacion && (
                  <>
                    <div className="producto-opcion mb-4">
                      <label className="form-label label-caps">Material</label>
                      <div className="metal-opciones">
                        {producto.metalesDisponibles.map((m) => (
                          <label key={m.nombre} className={`metal-opcion${metal === m.nombre ? ' selected' : ''}`}>
                            <input
                              type="radio"
                              name="metal"
                              value={m.nombre}
                              checked={metal === m.nombre}
                              onChange={() => setMetal(m.nombre)}
                            />
                            <span className="metal-nombre">{m.nombre}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {requiereTalla && (
                      <div className="producto-opcion mb-4">
                        <label className="form-label label-caps" htmlFor="talla">
                          Talla / medida <span className="text-gold">*</span>
                        </label>
                        <select
                          id="talla"
                          className="form-select"
                          value={talla}
                          onChange={(e) => setTalla(e.target.value)}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {tallas.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="producto-opcion mb-4">
                      <label className="form-label label-caps" htmlFor="grabado">
                        Grabado personalizado
                      </label>
                      <input
                        id="grabado"
                        type="text"
                        className="form-control"
                        placeholder='Ej: "María & Juan", iniciales, fecha...'
                        maxLength={200}
                        value={grabado}
                        onChange={(e) => setGrabado(e.target.value)}
                      />
                      <small className="text-muted">
                        Opcional. Recargo de {formatPrice(producto.recargoGrabado)} si incluye texto.
                      </small>
                    </div>
                  </>
                )}

                <div className="producto-opcion mb-4">
                  <label className="form-label label-caps" htmlFor="cantidad">Cantidad</label>
                  <input
                    id="cantidad"
                    type="number"
                    min="1"
                    max={producto.stock}
                    className="form-control producto-cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 1)}
                  />
                  <small className="text-muted">Stock disponible: {producto.stock}</small>
                </div>

                {esCliente ? (
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={adding || agotada}
                  >
                    {agotada
                      ? 'Agotada'
                      : adding
                        ? 'Agregando...'
                        : `Agregar al carrito — ${formatPrice(precioUnitario * cantidad)}`}
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-outline-light w-100 d-block text-center">
                    Inicia sesión para comprar
                  </Link>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
