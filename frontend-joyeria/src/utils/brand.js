export const BRAND_NAME = 'Laurea Joyeria'

export function tiendaUrl(categoria) {
  if (!categoria) return '/tienda'
  return `/tienda?categoria=${encodeURIComponent(categoria)}`
}
