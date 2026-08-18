import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import CategoryCard from '../components/CategoryCard'
import { getProductos, getCategorias } from '../services/catalogApi'
import { tiendaUrl } from '../utils/brand'
import './HomePage.css'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80'

export default function HomePage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    getProductos().then(setProductos).catch(() => {})
    getCategorias().then(setCategorias).catch(() => {})
  }, [])

  const destacados = productos.slice(0, 3)

  return (
    <div className="home-page">
      <Navbar />

      <section className="hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="label-caps">Artesanía desde 1987</p>
          <h1 className="hero-title">
            Joyas que <em>eternizan</em> momentos
          </h1>
          <p className="hero-subtitle">
            Cada pieza es una obra maestra artesanal, forjada a mano con los metales
            más puros y las piedras más exquisitas.
          </p>
          <div className="hero-actions">
            <Link to="/tienda" className="btn btn-primary">
              Explorar colección
            </Link>
            <Link to="/register" className="btn btn-outline-light">
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      <section id="destacados" className="section-padding">
        <div className="container-narrow">
          <h2 className="section-title text-center">Piezas Destacadas</h2>
          <div className="products-grid">
            {destacados.map((p) => (
              <ProductCard
                key={p.id}
                name={p.nombre}
                price={p.precio}
                image={p.imagenUrl}
                badge={p.permitePersonalizacion ? 'Personalizable' : null}
              />
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/tienda" className="btn btn-outline-light">Ver toda la tienda</Link>
          </div>
        </div>
      </section>

      <section id="colecciones" className="section-padding bg-surface">
        <div className="container-narrow">
          <p className="label-caps text-center mb-2">Por categoría</p>
          <h2 className="section-title text-center mb-5">Nuestras Colecciones</h2>
          <div className="categories-grid">
            {categorias.map((cat) => (
              <Link key={cat.id} to={tiendaUrl(cat.nombre)} style={{ flex: 1, textDecoration: 'none' }}>
                <CategoryCard name={cat.nombre} count={0} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
