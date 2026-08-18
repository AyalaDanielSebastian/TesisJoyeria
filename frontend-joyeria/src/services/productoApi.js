import { apiFetch, apiUpload } from './api'

export function getProductosGestion() {
  return apiFetch('/productos/gestion')
}

export function createProducto(data) {
  return apiFetch('/productos', { method: 'POST', body: JSON.stringify(data) })
}

export function updateProducto(id, data) {
  return apiFetch(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteProducto(id) {
  return apiFetch(`/productos/${id}`, { method: 'DELETE' })
}

export function uploadProductoImagen(id, file) {
  const fd = new FormData()
  fd.append('archivo', file)
  return apiUpload(`/productos/${id}/imagen`, fd)
}

export function getCategorias() {
  return apiFetch('/categorias')
}
