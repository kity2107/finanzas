import { useState } from 'react'
import { deleteExpense, updateExpense, deleteIngreso } from '../utils/sheetsApi'

const CATEGORY_COLORS = {
  'Alimentación': '#10b981', 'Transporte': '#3b82f6', 'Entretenimiento': '#f59e0b',
  'Salud': '#ef4444', 'Educación': '#8b5cf6', 'Hogar': '#06b6d4',
  'Ropa': '#ec4899', 'Servicios': '#f97316', 'Otros': '#6b7280',
}

const CATEGORY_EMOJIS = {
  'Alimentación': '🍔', 'Transporte': '🚌', 'Entretenimiento': '🎬',
  'Salud': '💊', 'Educación': '📚', 'Hogar': '🏠',
  'Ropa': '👕', 'Servicios': '💡', 'Otros': '💰',
}

const CATEGORIES = Object.keys(CATEGORY_EMOJIS)
const INCOME_EMOJIS = {
  'Sueldo': '💼', 'Freelance': '💻', 'Inversiones': '📈',
  'Alquiler': '🏘️', 'Venta': '🛒', 'Otros': '💵',
}

const fmt = (n) => `$${Math.round(n).toLocaleString('es')}`

export default function ExpenseList({ expenses, ingresos, token, spreadsheetId, onDelete, onEdit, onDeleteIngreso }) {
  const [tab, setTab] = useState('gastos')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const activeList = tab === 'gastos' ? expenses : ingresos

  const months = [...new Set(activeList.map(e => e.fecha.slice(0, 7)))]
    .sort()
    .reverse()

  const categories = [...new Set(activeList.map(e => e.categoria))].sort()

  const filtered = activeList.filter(e => {
    if (filterMonth && !e.fecha.startsWith(filterMonth)) return false
    if (filterCategory && e.categoria !== filterCategory) return false
    return true
  })

  const total = filtered.reduce((s, e) => s + e.monto, 0)

  const handleDeleteIngreso = async (id) => {
    if (!window.confirm('¿Eliminar este ingreso?')) return
    setDeletingId(id)
    try {
      await deleteIngreso(token, spreadsheetId, id)
      onDeleteIngreso(id)
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return
    setDeletingId(id)
    try {
      await deleteExpense(token, spreadsheetId, id)
      onDelete(id)
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (e) => {
    setEditingExpense(e)
    setEditForm({ ...e, monto: String(e.monto) })
  }

  const setField = (field, value) => setEditForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    if (!editForm.monto || !editForm.descripcion.trim()) return
    setSaving(true)
    try {
      const updated = { ...editForm, monto: parseFloat(editForm.monto) }
      await updateExpense(token, spreadsheetId, updated)
      onEdit(updated)
      setEditingExpense(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Tabs Gastos / Ingresos */}
      <div className="flex border-b border-gray-100 bg-white px-4 pt-4">
        {[['gastos', '💸 Gastos'], ['ingresos', '💰 Ingresos']].map(([t, label]) => (
          <button
            key={t}
            onClick={() => { setTab(t); setFilterMonth(''); setFilterCategory('') }}
            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Historial</h2>
        {filtered.length > 0 && (
          <span className={`text-sm font-bold ${tab === 'ingresos' ? 'text-blue-600' : 'text-emerald-600'}`}>
            {fmt(total)}
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-white text-gray-700"
        >
          <option value="">Todos los meses</option>
          {months.map(m => {
            const [year, month] = m.split('-')
            const label = new Date(Number(year), Number(month) - 1, 1)
              .toLocaleDateString('es', { month: 'long', year: 'numeric' })
            return <option key={m} value={m}>{label}</option>
          })}
        </select>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-white text-gray-700"
        >
          <option value="">Todas</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm">No hay {tab === 'gastos' ? 'gastos' : 'ingresos'} para mostrar</p>
        </div>
      ) : tab === 'gastos' ? (
        <div className="space-y-2">
          {filtered.map(e => (
            <div key={e.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: (CATEGORY_COLORS[e.categoria] || '#6b7280') + '18' }}
              >
                {CATEGORY_EMOJIS[e.categoria] || '💰'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{e.descripcion}</p>
                <p className="text-xs text-gray-400">{e.fecha} · {e.categoria}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-sm font-bold text-gray-800">{fmt(e.monto)}</span>
                <button
                  onClick={() => openEdit(e)}
                  className="text-gray-300 hover:text-emerald-400 transition-colors p-1"
                  aria-label="Editar gasto"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(e.id)}
                  disabled={deletingId === e.id}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-40"
                  aria-label="Eliminar gasto"
                >
                  {deletingId === e.id ? (
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
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(i => (
            <div key={i.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl bg-blue-50">
                {INCOME_EMOJIS[i.categoria] || '💵'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{i.descripcion}</p>
                <p className="text-xs text-gray-400">{i.fecha} · {i.categoria}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">+{fmt(i.monto)}</span>
                <button
                  onClick={() => handleDeleteIngreso(i.id)}
                  disabled={deletingId === i.id}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-40"
                  aria-label="Eliminar ingreso"
                >
                  {deletingId === i.id ? (
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
          ))}
        </div>
      )}

    </div>

      {/* Modal edición */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setEditingExpense(null)}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-md p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Editar gasto</h3>
              <button onClick={() => setEditingExpense(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Monto */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">$</span>
              <input
                type="number"
                min="0"
                step="any"
                value={editForm.monto}
                onChange={e => setField('monto', e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-xl font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Categoría */}
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setField('categoria', cat)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                    editForm.categoria === cat
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  <span className="block text-base mb-0.5">{CATEGORY_EMOJIS[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>

            {/* Descripción */}
            <input
              type="text"
              value={editForm.descripcion}
              onChange={e => setField('descripcion', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Descripción"
            />

            {/* Fecha */}
            <input
              type="date"
              value={editForm.fecha}
              onChange={e => setField('fecha', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />

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
              ) : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
