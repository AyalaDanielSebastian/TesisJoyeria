import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'joyeria_auth'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)

  const login = (authData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
    setUser(authData)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated: Boolean(user?.token) }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

export function getDashboardPath(rol) {
  switch (rol) {
    case 'Administrador':
      return '/admin'
    case 'Empleado':
      return '/empleado'
    default:
      return '/cliente'
  }
}
