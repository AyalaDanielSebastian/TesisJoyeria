import { formatPrice } from '../utils/format'
import { imagenUrl as resolveImg } from '../utils/format'
import './ProductCard.css'

export default function ProductCard({ name, price, badge, image }) {
  return (
    <article className="product-card">
      <div className="product-card-image-wrap">
        {badge && <span className="badge-gold product-badge">{badge}</span>}
        <img src={resolveImg(image)} alt={name} className="product-card-image" loading="lazy" />
      </div>
      <div className="product-card-body">
        <h3 className="product-card-name">{name}</h3>
        <p className="product-card-price">{formatPrice(price)}</p>
      </div>
    </article>
  )
}
