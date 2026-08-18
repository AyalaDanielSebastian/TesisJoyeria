import { apiFetch, apiUpload } from './api'

export function getMisOrdenes() {
  return apiFetch('/ordenes')
}

export function getOrden(id) {
  return apiFetch(`/ordenes/${id}`)
}

export function crearOrdenDesdeCarrito() {
  return apiFetch('/ordenes', { method: 'POST' })
}

export function subirComprobante(ordenId, file) {
  const fd = new FormData()
  fd.append('archivo', file)
  return apiUpload(`/ordenes/${ordenId}/comprobante`, fd)
}
