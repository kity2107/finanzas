import { useMemo } from 'react'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import CuotasCard from './CuotasCard'

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

export default function Dashboard({ expenses, ingresos, ahorros, cuotas = [] }) {
  const now = new Date()
  const curMonthStr = monthStr(now.getFullYear(), now.getMonth())

  const thisMonth = useMemo(
    () => expenses.filter(e => e.fecha.startsWith(curMonthStr)),
    [expenses, curMonthStr]
  )

  const thisMonthIngresos = useMemo(
    () => ingresos.filter(i => i.fecha.startsWith(curMonthStr)),
    [ingresos, curMonthStr]
  )

  const totalGastos = useMemo(
    () => thisMonth.reduce((s, e) => s + e.monto, 0),
    [thisMonth]
  )

  const totalIngresos = useMemo(
    () => thisMonthIngresos.reduce((s, i) => s + i.monto, 0),
    [thisMonthIngresos]
  )

  const balance = totalIngresos - totalGastos

  const totalAhorros = useMemo(
    () => ahorros.reduce((s, a) => a.tipo === 'deposito' ? s + a.monto : s - a.monto, 0),
    [ahorros]
  )

  const ahorrosPorDestino = useMemo(() => {
    const map = {}
    ahorros.forEach(a => {
      const d = a.destino || 'General'
      map[d] = (map[d] || 0) + (a.tipo === 'deposito' ? a.monto : -a.monto)
    })
    return Object.entries(map)
      .map(([destino, total]) => ({ destino, total }))
      .sort((a, b) => b.total - a.total)
  }, [ahorros])

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

  const fmt = (n) => `$${Math.round(n).toLocaleString('es')}`

  return (
    <div className="p-4 space-y-4">
      {/* Tarjeta principal: balance */}
      <div className={`text-white rounded-2xl p-5 ${balance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
        <p className={`text-sm ${balance >= 0 ? 'text-emerald-100' : 'text-red-100'}`}>
          {now.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
        </p>
        <p className="text-xs font-medium mt-1 opacity-80">Balance del mes</p>
        <p className="text-4xl font-bold mt-1">{fmt(balance)}</p>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-xs opacity-70">Ingresos</p>
            <p className="font-semibold text-sm">{fmt(totalIngresos)}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Gastos</p>
            <p className="font-semibold text-sm">{fmt(totalGastos)}</p>
          </div>
        </div>
      </div>

      {/* Compromisos de tarjeta */}
      <CuotasCard cuotas={cuotas} />

      {/* Cards secundarias */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ahorros acumulados */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 shadow-sm">
          <p className="text-violet-400 text-xs">Ahorros totales</p>
          <p className={`font-bold text-lg mt-1 ${totalAhorros >= 0 ? 'text-violet-700' : 'text-red-600'}`}>
            {fmt(totalAhorros)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-400 text-xs">Mayor categoría gasto</p>
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

      {/* Ahorros por destino */}
      {ahorrosPorDestino.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 font-semibold mb-3 text-sm">Ahorros por destino</h3>
          <div className="space-y-2">
            {ahorrosPorDestino.map(({ destino, total }) => {
              const pct = totalAhorros > 0 ? Math.max(0, (total / totalAhorros) * 100) : 0
              return (
                <div key={destino}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs text-gray-600">{destino}</span>
                    <span className={`text-xs font-semibold ${total >= 0 ? 'text-violet-700' : 'text-red-500'}`}>
                      {fmt(total)}
                    </span>
                  </div>
                  {total > 0 && (
                    <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pie chart categorias */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 font-semibold mb-3 text-sm">Gastos por categoría este mes</h3>
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

      {/* Bar chart ultimos 6 meses (gastos) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-gray-700 font-semibold mb-3 text-sm">Gastos últimos 6 meses</h3>
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

      {/* Recientes (gastos) */}
      {expenses.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 font-semibold mb-3 text-sm">Gastos recientes</h3>
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

      {/* Ingresos recientes */}
      {ingresos.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 font-semibold mb-3 text-sm">Ingresos recientes</h3>
          <div className="space-y-3">
            {ingresos.slice(0, 3).map(i => (
              <div key={i.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg bg-blue-50">
                  💵
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{i.descripcion}</p>
                  <p className="text-xs text-gray-400">{i.fecha} · {i.categoria}</p>
                </div>
                <span className="text-sm font-bold text-blue-600 flex-shrink-0">+{fmt(i.monto)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
