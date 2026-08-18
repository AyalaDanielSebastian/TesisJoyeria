import { apiFetch } from './api'

export function getOrdenesEmpleado() {
  return apiFetch('/empleado/ordenes')
}

export function getOrdenEmpleado(id) {
  return apiFetch(`/empleado/ordenes/${id}`)
}

export function actualizarEstadoOrden(id, estado, notasVerificacion = '', montoPagado = null) {
  return apiFetch(`/empleado/ordenes/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({
      estado,
      notasVerificacion,
      ...(montoPagado != null ? { montoPagado } : {}),
    }),
  })
}
