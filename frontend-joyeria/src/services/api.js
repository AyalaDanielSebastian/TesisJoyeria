import { useAuth } from '../context/AuthContext'

export function authHeaders() {
  const raw = localStorage.getItem('joyeria_auth')
  const token = raw ? JSON.parse(raw).token : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function apiFetch(path, options = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      ...options,
      headers: { ...authHeaders(), ...options.headers },
    })
  } catch {
    throw new Error('No se pudo conectar con la API. Verifica que el backend esté en http://localhost:5243')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Error en la solicitud')
  if (res.status === 204) return null
  return data
}

export async function apiUpload(path, formData) {
  const raw = localStorage.getItem('joyeria_auth')
  const token = raw ? JSON.parse(raw).token : null

  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Error al subir archivo')
  return data
}
