export const BRAND_NAME = 'Láurea Joyeria'
export const BRAND_LOGO = '/logo-laurea.png'

export function tiendaUrl(categoria) {
  if (!categoria) return '/tienda'
  return `/tienda?categoria=${encodeURIComponent(categoria)}`
}
