import { useState } from 'react'
import { addGastoFijo, updateGastoFijo, deleteGastoFijo } from '../utils/sheetsApi'

const CATEGORIES = ['Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 'Educación', 'Hogar', 'Ropa', 'Servicios', 'Otros']
const CATEGORY_EMOJIS = {
  'Alimentación': '🍔', 'Transporte': '🚌', 'Entretenimiento': '🎬',
  'Salud': '💊', 'Educación': '📚', 'Hogar': '🏠',
  'Ropa': '👕', 'Servicios': '💡', 'Otros': '💰',
}

const fmt = (n) => `$${Math.round(n).toLocaleString('es')}`

function getDaysUntil(diaVencimiento) {
  const hoy = new Date()
  const diaHoy = hoy.getDate()
  const mesHoy = hoy.getMonth()
  const anioHoy = hoy.getFullYear()

  let venc = new Date(anioHoy, mesHoy, diaVencimiento)
  if (diaVencimiento < diaHoy) {
    venc = new Date(anioHoy, mesHoy + 1, diaVencimiento)
  }
  const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24))
  return diff
}

const EMPTY_FORM = { nombre: '', categoria: 'Servicios', monto: '', diaVencimiento: '1' }

export default function FixedExpensesList({ gastosFijos, token, spreadsheetId, onAdd, onEdit, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editingGasto, setEditingGasto] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const totalMensual = gastosFijos.reduce((s, g) => s + g.monto, 0)

  const sorted = [...gastosFijos].sort((a, b) => a.diaVencimiento - b.diaVencimiento)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const openAdd = () => {
    setEditingGasto(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (g) => {
    setEditingGasto(g)
    setForm({ nombre: g.nombre, categoria: g.categoria, monto: String(g.monto), diaVencimiento: String(g.diaVencimiento) })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.monto) return
    setSaving(true)
    try {
      const data = { ...form, monto: parseFloat(form.monto), diaVencimiento: parseInt(form.diaVencimiento) }
      if (editingGasto) {
        await updateGastoFijo(token, spreadsheetId, { ...data, id: editingGasto.id })
        onEdit({ ...data, id: editingGasto.id })
      } else {
        const nuevo = await addGastoFijo(token, spreadsheetId, data)
        onAdd(nuevo)
      }
      setShowForm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este gasto fijo?')) return
    setDeletingId(id)
    try {
      await deleteGastoFijo(token, spreadsheetId, id)
      onDelete(id)
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Gastos Fijos</h2>
          {gastosFijos.length > 0 && (
            <p className="text-xs text-gray-400">Total mensual: <span className="font-semibold text-gray-700">{fmt(totalMensual)}</span></p>
          )}
        </div>
        <button
          onClick={openAdd}
          className="w-9 h-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📅</p>
          <p className="text-sm font-medium">Sin gastos fijos</p>
          <p className="text-xs mt-1">Tocá + para agregar alquiler, servicios, etc.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(g => {
            const days = getDaysUntil(g.diaVencimiento)
            const urgent = days <= 3
            const soon = days <= 7 && days > 3
            return (
              <div key={g.id} className={`bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 border-l-4 ${
                urgent ? 'border-red-400' : soon ? 'border-amber-400' : 'border-transparent'
              }`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl bg-gray-50">
                  {CATEGORY_EMOJIS[g.categoria] || '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{g.nombre}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">Día {g.diaVencimiento} de cada mes</p>
                    {urgent && <span className="text-xs text-red-500 font-semibold">¡{days}d!</span>}
                    {soon && <span className="text-xs text-amber-500 font-semibold">{days}d</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-800">{fmt(g.monto)}</span>
                  <button
                    onClick={() => openEdit(g)}
                    className="text-gray-300 hover:text-emerald-400 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    disabled={deletingId === g.id}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-40"
                  >
                    {deletingId === g.id ? (
                      <span className="w-4 h-4 border border-red-300 border-t-transparent rounded-full animate-spin block" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal agregar/editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-md p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editingGasto ? 'Editar gasto fijo' : 'Nuevo gasto fijo'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nombre */}
            <input
              type="text"
              placeholder="Ej: Alquiler, Netflix, Luz..."
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              autoFocus
            />

            {/* Monto */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">$</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={form.monto}
                onChange={e => set('monto', e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-xl font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Día de vencimiento */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Día de vencimiento / pago</label>
              <input
                type="number"
                min="1"
                max="31"
                value={form.diaVencimiento}
                onChange={e => set('diaVencimiento', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-lg font-bold"
              />
            </div>

            {/* Categoría */}
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('categoria', cat)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                    form.categoria === cat
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  <span className="block text-base mb-0.5">{CATEGORY_EMOJIS[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-60 transition-all"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : editingGasto ? 'Guardar cambios' : 'Agregar gasto fijo'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
