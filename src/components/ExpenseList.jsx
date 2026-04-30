import { useState } from 'react'
import { deleteExpense } from '../utils/sheetsApi'

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

const fmt = (n) => `$${Math.round(n).toLocaleString('es')}`

export default function ExpenseList({ expenses, token, spreadsheetId, onDelete }) {
  const [filterMonth, setFilterMonth] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const months = [...new Set(expenses.map(e => e.fecha.slice(0, 7)))]
    .sort()
    .reverse()

  const categories = [...new Set(expenses.map(e => e.categoria))].sort()

  const filtered = expenses.filter(e => {
    if (filterMonth && !e.fecha.startsWith(filterMonth)) return false
    if (filterCategory && e.categoria !== filterCategory) return false
    return true
  })

  const total = filtered.reduce((s, e) => s + e.monto, 0)

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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Historial</h2>
        {filtered.length > 0 && (
          <span className="text-sm font-bold text-emerald-600">{fmt(total)}</span>
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
          <p className="text-sm">No hay gastos para mostrar</p>
        </div>
      ) : (
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
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm font-bold text-gray-800">{fmt(e.monto)}</span>
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
      )}
    </div>
  )
}
