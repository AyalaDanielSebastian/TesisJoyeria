export function formatPrice(amount) {
  return `$${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: Number(amount) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

export function imagenUrl(url) {
  if (!url) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80'
  if (url.startsWith('/uploads')) return url
  return url
}

export const ESTADOS_ORDEN = {
  PendientePago: 'Pendiente de pago',
  PendienteVerificacion: 'Pendiente de verificación',
  AnticipoValidado: 'Anticipo validado',
  Aprobada: 'Aprobada',
  Rechazada: 'Rechazada',
  Cancelada: 'Cancelada',
}
