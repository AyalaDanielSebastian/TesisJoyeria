import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/Layout'
import ProductManager from '../components/ProductManager'
import { getUsuarios, updateUsuarioRol, updateUsuarioActivo } from '../services/adminApi'
import './AdminDashboard.css'

const ROLES = ['Administrador', 'Empleado', 'Cliente']

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-EC')
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [rolesEdit, setRolesEdit] = useState({})

  const cargarUsuarios = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getUsuarios()
      setUsuarios(data)
      const edits = {}
      data.forEach((u) => { edits[u.id] = u.rol })
      setRolesEdit(edits)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  const handleGuardarRol = async (usuarioId) => {
    setSavingId(usuarioId)
    setError('')
    setSuccess('')
    try {
      const updated = await updateUsuarioRol(usuarioId, rolesEdit[usuarioId])
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioId ? updated : u))
      )
      setSuccess(`Rol de ${updated.nombre} actualizado a ${updated.rol}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingId(null)
    }
  }

  const handleToggleActivo = async (u) => {
    if (u.id === user.id) return
    const accion = u.activo ? 'desactivar' : 'activar'
    if (!confirm(`¿Seguro que deseas ${accion} a ${u.nombre}?`)) return

    setSavingId(u.id)
    setError('')
    setSuccess('')
    try {
      const updated = await updateUsuarioActivo(u.id, !u.activo)
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? updated : x)))
      setSuccess(
        updated.activo
          ? `${updated.nombre} reactivado.`
          : `${updated.nombre} desactivado.`
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <DashboardLayout
      title="Panel de administración"
      subtitle={`Administrador: ${user.nombre}`}
    >
      <div className="admin-tabs mb-4">
        <button type="button" className={`admin-tab${tab === 'usuarios' ? ' active' : ''}`}
          onClick={() => setTab('usuarios')}>Usuarios</button>
        <button type="button" className={`admin-tab${tab === 'productos' ? ' active' : ''}`}
          onClick={() => setTab('productos')}>Catálogo</button>
      </div>

      {tab === 'productos' ? (
        <ProductManager />
      ) : (
        <>
      <div className="admin-info card-brand dashboard-card mb-4">
        
        <p className="mb-0">
          Gestiona roles, desactiva usuarios y consulta la auditoría
          (último acceso, modificaciones y fechas).
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success admin-success">{success}</div>}

      {loading ? (
        <p className="text-muted">Cargando usuarios...</p>
      ) : (
        <div className="admin-table-wrap card-brand">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Último acceso</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const esYo = u.id === user.id
                const cambio = rolesEdit[u.id] !== u.rol
                return (
                  <tr key={u.id} className={`${esYo ? 'admin-row-self' : ''}${!u.activo ? ' admin-row-inactive' : ''}`}>
                    <td className="admin-name">{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={u.activo ? 'admin-status-activo' : 'admin-status-inactivo'}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {!u.activo && u.fechaDesactivacion && (
                        <small className="d-block text-muted">{fmtDate(u.fechaDesactivacion)}</small>
                      )}
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm admin-select"
                        value={rolesEdit[u.id]}
                        disabled={esYo || !u.activo}
                        onChange={(e) =>
                          setRolesEdit((prev) => ({ ...prev, [u.id]: e.target.value }))
                        }
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="admin-date">{fmtDate(u.fechaRegistro)}</td>
                    <td className="admin-date">{fmtDate(u.ultimoAcceso)}</td>
                    <td className="admin-date">
                      {fmtDate(u.fechaActualizacion)}
                      {u.modificadoPorNombre && (
                        <small className="d-block text-muted">por {u.modificadoPorNombre}</small>
                      )}
                    </td>
                    <td className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm admin-save-btn me-1"
                        disabled={esYo || !cambio || savingId === u.id}
                        onClick={() => handleGuardarRol(u.id)}
                      >
                        {savingId === u.id ? '...' : 'Guardar rol'}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${u.activo ? 'btn-outline-light' : 'btn-primary'}`}
                        disabled={esYo || savingId === u.id}
                        onClick={() => handleToggleActivo(u)}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </DashboardLayout>
  )
}
