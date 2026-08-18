export const BRAND_NAME = 'Artisanal Jewelry'

export function tiendaUrl(categoria) {
  if (!categoria) return '/tienda'
  return `/tienda?categoria=${encodeURIComponent(categoria)}`
}
