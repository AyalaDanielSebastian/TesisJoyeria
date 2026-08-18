import { useCallback, useEffect, useState } from 'react'
import {
  createProducto,
  deleteProducto,
  getCategorias,
  getProductosGestion,
  updateProducto,
  uploadProductoImagen,
} from '../services/productoApi'
import { formatPrice, imagenUrl } from '../utils/format'
import './ProductManager.css'

const MATERIALES_BASE = ['Plata italiana', 'Acero inoxidable']

const EMPTY = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoriaId: '',
  permitePersonalizacion: true,
  activo: true,
  imagenUrl: '',
  materialDefault: 'Plata italiana',
  metalesDisponibles: [...MATERIALES_BASE],
  materialExtra: '',
  tallasDisponibles: '',
  recargoGrabado: '1.50',
}

export default function ProductManager() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imagenFile, setImagenFile] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([getProductosGestion(), getCategorias()])
      setProductos(prods)
      setCategorias(cats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirNuevo = () => {
    setEditId(null)
    setForm({ ...EMPTY, categoriaId: categorias[0]?.id ?? '' })
    setImagenFile(null)
    setShowForm(true)
  }

  const abrirEditar = (p) => {
    setEditId(p.id)
    const metales = p.metalesDisponibles?.length
      ? [...p.metalesDisponibles]
      : [...MATERIALES_BASE]
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      categoriaId: p.categoriaId,
      permitePersonalizacion: p.permitePersonalizacion,
      activo: p.activo,
      imagenUrl: p.imagenUrl,
      materialDefault: p.materialDefault || metales[0] || 'Plata italiana',
      metalesDisponibles: metales,
      materialExtra: '',
      tallasDisponibles: p.tallasDisponibles || '',
      recargoGrabado: p.recargoGrabado ?? 1.5,
    })
    setImagenFile(null)
    setShowForm(true)
  }

  const toggleMaterial = (nombre) => {
    setForm((prev) => {
      const tiene = prev.metalesDisponibles.includes(nombre)
      const metalesDisponibles = tiene
        ? prev.metalesDisponibles.filter((m) => m !== nombre)
        : [...prev.metalesDisponibles, nombre]
      return {
        ...prev,
        metalesDisponibles,
        materialDefault: metalesDisponibles.includes(prev.materialDefault)
          ? prev.materialDefault
          : (metalesDisponibles[0] || ''),
      }
    })
  }

  const agregarMaterialExtra = () => {
    const nombre = form.materialExtra.trim()
    if (!nombre) return
    if (form.metalesDisponibles.some((m) => m.toLowerCase() === nombre.toLowerCase())) {
      setForm((prev) => ({ ...prev, materialExtra: '' }))
      return
    }
    setForm((prev) => ({
      ...prev,
      metalesDisponibles: [...prev.metalesDisponibles, nombre],
      materialDefault: prev.materialDefault || nombre,
      materialExtra: '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.permitePersonalizacion && form.metalesDisponibles.length === 0) {
      setError('Selecciona al menos un material para la joya.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock, 10),
        categoriaId: parseInt(form.categoriaId, 10),
        permitePersonalizacion: form.permitePersonalizacion,
        activo: form.activo,
        imagenUrl: form.imagenUrl,
        materialDefault: form.metalesDisponibles[0] || form.materialDefault,
        metalesDisponibles: form.metalesDisponibles,
        tallasDisponibles: form.tallasDisponibles,
        recargoGrabado: parseFloat(form.recargoGrabado) || 0,
      }

      let producto
      if (editId) {
        producto = await updateProducto(editId, payload)
      } else {
        producto = await createProducto(payload)
      }

      if (imagenFile) {
        producto = await uploadProductoImagen(producto.id, imagenFile)
      }

      setSuccess(editId ? 'Producto actualizado.' : 'Producto creado.')
      setShowForm(false)
      if (editId && form.activo === false) {
        setProductos((prev) => prev.filter((p) => p.id !== editId))
      } else {
        await cargar()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Desactivar este producto del catálogo? Ya no aparecerá en la lista ni en la tienda.')) return
    try {
      await deleteProducto(id)
      setProductos((prev) => prev.filter((p) => p.id !== id))
      setSuccess('Producto desactivado y quitado de la lista.')
    } catch (err) {
      setError(err.message)
    }
  }

  const productosActivos = productos.filter((p) => p.activo)

  return (
    <div className="product-manager">
      <div className="product-manager-header">
        <h2 className="section-title h4 mb-0">Catálogo de joyas</h2>
        <button type="button" className="btn btn-primary btn-sm" onClick={abrirNuevo}>
          + Nueva joya
        </button>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {success && <div className="alert alert-success mt-3">{success}</div>}

      {loading ? (
        <p className="text-muted mt-4">Cargando productos...</p>
      ) : productosActivos.length === 0 ? (
        <p className="text-muted mt-4">No hay productos activos en el catálogo.</p>
      ) : (
        <div className="admin-table-wrap card-brand mt-4">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Personalizable</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productosActivos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img src={imagenUrl(p.imagenUrl)} alt="" className="pm-thumb" />
                  </td>
                  <td className="admin-name">{p.nombre}</td>
                  <td>{p.categoriaNombre}</td>
                  <td className="text-gold">{formatPrice(p.precio)}</td>
                  <td>
                    {p.stock === 0 ? (
                      <span className="badge-agotada-inline">Agotada</span>
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td>{p.permitePersonalizacion ? 'Sí' : 'No'}</td>
                  <td>
                    <button type="button" className="btn btn-outline-light btn-sm me-1" onClick={() => abrirEditar(p)}>
                      Editar
                    </button>
                    <button type="button" className="navbar-logout" onClick={() => handleEliminar(p.id)}>
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="pm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="pm-modal card-brand" onClick={(e) => e.stopPropagation()}>
            <h3 className="auth-title mb-4">{editId ? 'Editar joya' : 'Nueva joya'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input className="form-control" value={form.nombre} required
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" rows={3} value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label">Precio ($)</label>
                  <input type="number" step="0.01" min="0.01" className="form-control" required
                    value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label">Stock</label>
                  <input type="number" min="0" className="form-control" required
                    value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Categoría</label>
                <select className="form-select" required value={form.categoriaId}
                  onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Imagen</label>
                <input type="file" accept="image/*" className="form-control"
                  onChange={(e) => setImagenFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="permitePers"
                  checked={form.permitePersonalizacion}
                  onChange={(e) => setForm({ ...form, permitePersonalizacion: e.target.checked })} />
                <label className="form-check-label" htmlFor="permitePers">
                  Permite personalización (metal, talla, grabado)
                </label>
              </div>
              {form.permitePersonalizacion && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Materiales disponibles (cliente)</label>
                    <div className="pm-materiales">
                      {[...MATERIALES_BASE, ...form.metalesDisponibles.filter((m) => !MATERIALES_BASE.includes(m))].map((m) => (
                        <label key={m} className="form-check d-block mb-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={form.metalesDisponibles.includes(m)}
                            onChange={() => toggleMaterial(m)}
                          />
                          <span className="form-check-label">{m}</span>
                        </label>
                      ))}
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      <input
                        className="form-control"
                        placeholder="Agregar otro material..."
                        value={form.materialExtra}
                        onChange={(e) => setForm({ ...form, materialExtra: e.target.value })}
                      />
                      <button type="button" className="btn btn-outline-light btn-sm" onClick={agregarMaterialExtra}>
                        Añadir
                      </button>
                    </div>
                    <small className="text-muted">
                      Solo los materiales marcados se muestran al cliente. El precio de la joya no cambia por material.
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tallas disponibles</label>
                    <input className="form-control" placeholder="Ej: 5,6,7,8,9,10 o S,M,L"
                      value={form.tallasDisponibles}
                      onChange={(e) => setForm({ ...form, tallasDisponibles: e.target.value })} />
                    <small className="text-muted">Separadas por coma. Dejar vacío si no aplica.</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Recargo por grabado ($)</label>
                    <input type="number" step="0.01" min="0" className="form-control"
                      value={form.recargoGrabado}
                      onChange={(e) => setForm({ ...form, recargoGrabado: e.target.value })} />
                  </div>
                </>
              )}
              {editId && (
                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id="activo"
                    checked={form.activo}
                    onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                  <label className="form-check-label" htmlFor="activo">Activo en catálogo</label>
                </div>
              )}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="btn btn-outline-light" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
