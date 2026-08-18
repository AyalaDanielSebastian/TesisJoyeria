import './CategoryCard.css'

export default function CategoryCard({ name, count, active }) {
  return (
    <article className={`category-card${active ? ' category-card--active' : ''}`}>
      <h3 className="category-card-name">{name}</h3>
      <p className="category-card-count">{count} piezas</p>
    </article>
  )
}
