import { apiFetch } from './api'

export function getProductos(categoriaId) {
  const q = categoriaId ? `?categoriaId=${categoriaId}` : ''
  return apiFetch(`/productos${q}`)
}

export function getCategorias() {
  return apiFetch('/categorias')
}

export function getProducto(id) {
  return apiFetch(`/productos/${id}`)
}

export function calcularPrecioProducto(id, { metal = '', talla = '', grabado = '', cantidad = 1 }) {
  return apiFetch(`/productos/${id}/calcular-precio`, {
    method: 'POST',
    body: JSON.stringify({ metal, talla, grabado, cantidad }),
  })
}
