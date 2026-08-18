const raw = import.meta.env.VITE_API_URL ?? ''
export const API_ORIGIN = raw.replace(/\/$/, '')
export const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api` : '/api'
