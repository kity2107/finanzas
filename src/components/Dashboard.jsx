import { useMemo } from 'react'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

const CATEGORIES = {
  'Alimentación':   { color: '#10b981', emoji: '🍔' },
  'Transporte':     { color: '#3b82f6', emoji: '🚌' },
  'Entretenimiento':{ color: '#f59e0b', emoji: '🎬' },
  'Salud':          { color: '#ef4444', emoji: '💊' },
  'Educación':      { color: '#8b5cf6', emoji: '📚' },
  'Hogar':          { color: '#06b6d4', emoji: '🏠' },
  'Ropa':           { color: '#ec4899', emoji: '👕' },
  'Servicios':      { color: '#f97316', emoji: '💡' },
  'Otros':          { color: '#6b7280', emoji: '💰' },
}

function monthStr(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export default function Dashboard({ expenses }) {
  const now = new Date()
  const curMonthStr = monthStr(now.getFullYear(), now.getMonth())

  const thisMonth = useMemo(
    () => expenses.filter(e => e.fecha.startsWith(curMonthStr)),
    [expenses, curMonthStr]
  )

  const totalMes = useMemo(
    () => thisMonth.reduce((s, e) => s + e.monto, 0),
    [thisMonth]
  )

  const byCategory = useMemo(() => {
    const map = {}
    thisMonth.forEach(e => {
      map[e.categoria] = (map[e.categoria] || 0) + e.monto
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, color: CATEGORIES[name]?.color || '#6b7280' }))
      .sort((a, b) => b.value - a.value)
  }, [thisMonth])

  const last6 = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const ms = monthStr(d.getFullYear(), d.getMonth())
      const total = expenses
        .filter(e => e.fecha.startsWith(ms))
        .reduce((s, e) => s + e.monto, 0)
      months.push({
        name: d.toLocaleDateString('es', { month: 'short' }),
        total,
      })
    }
    return months
  }, [expenses])

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const promDiario = totalMes / daysInMonth

  const fmt = (n) => `$${Math.round(n).toLocaleString('es')}`

  return (
    <div className="p-4 space-y-4">
      {/* Tarjeta principal */}
      <div className="bg-emerald-500 text-white rounded-2xl p-5">
        <p className="text-emerald-100 text-sm">
          {now.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
        </p>
        <p className="text-4xl font-bold mt-1">{fmt(totalMes)}</p>
        <p className="text-emerald-200 text-xs mt-1">{thisMonth.length} transacciones</p>
      </div>

      {/* Cards secundarias */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-400 text-xs">Promedio diario</p>
          <p className="text-gray-800 font-bold text-lg mt-1">{fmt(promDiario)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-400 text-xs">Mayor categoría</p>
          {byCategory[0] ? (
            <>
              <p className="text-gray-800 font-semibold text-sm mt-1 truncate">{byCategory[0].name}</p>
              <p className="text-emerald-600 font-bold">{fmt(byCategory[0].value)}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm mt-1">—</p>
          )}
        </div>
      </div>

      {/* Pie chart categorias */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 font-semibold mb-3 text-sm">Por categoría este mes</h3>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie
                  data={byCategory}
                  cx={60}
                  cy={60}
                  innerRadius={38}
                  outerRadius={60}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 min-w-0">
              {byCategory.slice(0, 5).map(cat => (
                <div key={cat.name} className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs text-gray-500 truncate">{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800 flex-shrink-0">{fmt(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bar chart ultimos 6 meses */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-gray-700 font-semibold mb-3 text-sm">Últimos 6 meses</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={last6} barSize={26}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(v) => [fmt(v), 'Total']}
              contentStyle={{
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                fontSize: 12,
              }}
            />
            <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recientes */}
      {expenses.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 font-semibold mb-3 text-sm">Recientes</h3>
          <div className="space-y-3">
            {expenses.slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg bg-gray-50">
                  {CATEGORIES[e.categoria]?.emoji || '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{e.descripcion}</p>
                  <p className="text-xs text-gray-400">{e.fecha} · {e.categoria}</p>
                </div>
                <span className="text-sm font-bold text-gray-800 flex-shrink-0">{fmt(e.monto)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">💸</p>
          <p className="text-sm font-medium">Aún no hay gastos</p>
          <p className="text-xs mt-1">Toca + para registrar tu primer gasto</p>
        </div>
      )}
    </div>
  )
}
