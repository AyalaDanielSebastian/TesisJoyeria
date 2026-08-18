import { apiFetch, apiUpload } from './api'

export function getMisOrdenes() {
  return apiFetch('/ordenes')
}

export function getOrden(id) {
  return apiFetch(`/ordenes/${id}`)
}

export function crearOrdenDesdeCarrito(itemIds, envio) {
  return apiFetch('/ordenes', {
    method: 'POST',
    body: JSON.stringify({
      itemIds: itemIds ?? [],
      nombreDestinatario: envio?.nombre ?? '',
      telefono: envio?.telefono ?? '',
      direccion: envio?.direccion ?? '',
      ciudad: envio?.ciudad ?? '',
      referencia: envio?.referencia || null,
    }),
  })
}

export function subirComprobante(ordenId, file) {
  const fd = new FormData()
  fd.append('archivo', file)
  return apiUpload(`/ordenes/${ordenId}/comprobante`, fd)
}
