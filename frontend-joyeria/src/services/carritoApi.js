import { apiFetch } from './api'

export function getCarrito() {
  return apiFetch('/carrito')
}

export function addToCarrito(productoId, cantidad, { metal = '', talla = '', grabado = '' } = {}) {
  return apiFetch('/carrito', {
    method: 'POST',
    body: JSON.stringify({ productoId, cantidad, metal, talla, grabado }),
  })
}

export function updateCarritoItem(itemId, cantidad, { metal = '', talla = '', grabado = '' } = {}) {
  return apiFetch(`/carrito/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ cantidad, metal, talla, grabado }),
  })
}

export function removeFromCarrito(itemId) {
  return apiFetch(`/carrito/items/${itemId}`, { method: 'DELETE' })
}
