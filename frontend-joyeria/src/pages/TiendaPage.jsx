import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getProductos, getCategorias } from '../services/catalogApi'
import { formatPrice, imagenUrl } from '../utils/format'
import '../components/ProductCard.css'
import './TiendaPage.css'

export default function TiendaPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtro, setFiltro] = useState(null)
  const [loading, setLoading] = useState(true)

  const categoriaParam = searchParams.get('categoria')

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {})
  }, [])

  useEffect(() => {
    if (!categoriaParam) {
      setFiltro(null)
      return
    }
    const cat = categorias.find(
      (c) => c.nombre.toLowerCase() === categoriaParam.toLowerCase()
    )
    setFiltro(cat?.id ?? null)
  }, [categoriaParam, categorias])

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const prods = await getProductos(filtro ?? undefined)
      setProductos(prods)
    } finally {
      setLoading(false)
    }
  }, [filtro])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [categoriaParam])

  const seleccionarCategoria = (catId, catNombre) => {
    if (catId) {
      setSearchParams({ categoria: catNombre })
    } else {
      setSearchParams({})
    }
  }

  const categoriaActiva = categorias.find((c) => c.id === filtro)

  return (
    <div className="home-page">
      <Navbar />
      <section className="section-padding tienda-header">
        <div className="container-narrow">
          <p className="label-caps">Colección</p>
          <h1 className="section-title">
            {categoriaActiva ? categoriaActiva.nombre : 'Tienda de joyas'}
          </h1>
          <p className="text-muted">Explora el catálogo y personaliza cada pieza en su ficha.</p>

          {!isAuthenticated && (
            <div className="alert alert-success mt-3">
              <Link to="/login">Inicia sesión</Link> o <Link to="/register">regístrate</Link> para comprar y personalizar.
            </div>
          )}

          <div className="tienda-filters mt-4">
            <button type="button" className={`tienda-filter${!filtro ? ' active' : ''}`}
              onClick={() => seleccionarCategoria(null, null)}>Todas</button>
            {categorias.map((c) => (
              <button key={c.id} type="button"
                className={`tienda-filter${filtro === c.id ? ' active' : ''}`}
                onClick={() => seleccionarCategoria(c.id, c.nombre)}>{c.nombre}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container-narrow">
          {loading ? (
            <p className="text-muted">Cargando catálogo...</p>
          ) : productos.length === 0 ? (
            <p className="text-muted">No hay productos en esta categoría.</p>
          ) : (
            <div className="products-grid">
              {productos.map((p) => {
                const agotada = p.stock === 0
                return (
                  <Link
                    key={p.id}
                    to={`/tienda/producto/${p.id}`}
                    className={`product-card tienda-card product-card-link${agotada ? ' product-card--agotada' : ''}`}
                  >
                    <div className="product-card-image-wrap">
                      {p.permitePersonalizacion && !agotada && (
                        <span className="badge-gold product-badge">Personalizable</span>
                      )}
                      {agotada && (
                        <span className="badge-agotada">Agotada</span>
                      )}
                      <img src={imagenUrl(p.imagenUrl)} alt={p.nombre} className="product-card-image" />
                    </div>
                    <div className="product-card-body">
                      <p className="label-caps mb-1">{p.categoriaNombre}</p>
                      <h3 className="product-card-name">{p.nombre}</h3>
                      <p className="text-muted small mb-2">{p.descripcion.slice(0, 80)}...</p>
                      <p className="product-card-price">{formatPrice(p.precio)}</p>
                      <span className="btn btn-outline-light btn-sm w-100 mt-2 d-block text-center">
                        {agotada ? 'Ver producto (agotada)' : 'Ver producto'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}
