import { apiFetch } from './api'

export function getUsuarios() {
  return apiFetch('/admin/usuarios')
}

export function updateUsuarioRol(id, rol) {
  return apiFetch(`/admin/usuarios/${id}/rol`, {
    method: 'PUT',
    body: JSON.stringify({ rol }),
  })
}

export function updateUsuarioActivo(id, activo) {
  return apiFetch(`/admin/usuarios/${id}/activo`, {
    method: 'PUT',
    body: JSON.stringify({ activo }),
  })
}
