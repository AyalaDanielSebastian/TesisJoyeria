export const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Pulsera Constelación',
    price: 2450,
    badge: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  },
  {
    id: 2,
    name: 'Anillo Esmeralda Imperial',
    price: 8900,
    badge: 'Exclusivo',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  },
  {
    id: 3,
    name: 'Pendientes Perla Divina',
    price: 3200,
    badge: null,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  },
]

export const CATEGORIES = [
  { name: 'Anillos', count: 42 },
  { name: 'Collares', count: 28 },
  { name: 'Pendientes', count: 35 },
  { name: 'Pulseras', count: 19 },
]

export function formatPrice(amount) {
  return `$${amount.toLocaleString('en-US')}`
}
