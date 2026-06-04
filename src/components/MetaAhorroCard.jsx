import { useMemo, useState } from 'react'

function monthStr(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export default function MetaAhorroCard({ metaAhorro, ingresos, ahorros, onSave }) {
  const [showConfig, setShowConfig] = useState(false)
  const [formPct, setFormPct] = useState(String(metaAhorro.metaPct))
  const [formSueldo, setFormSueldo] = useState(metaAhorro.sueldoBase != null ? String(metaAhorro.sueldoBase) : '')

  const now = new Date()
  const curMonthStr = monthStr(now.getFullYear(), now.getMonth())

  const sueldoEfectivo = useMemo(() => {
    if (metaAhorro.sueldoBase > 0) return metaAhorro.sueldoBase
    return ingresos
      .filter(i => i.fecha.startsWith(curMonthStr) && i.categoria === 'Sueldo')
      .reduce((s, i) => s + i.monto, 0)
  }, [metaAhorro.sueldoBase, ingresos, curMonthStr])

  const ahorradoMes = useMemo(() =>
    ahorros
      .filter(a => a.tipo === 'deposito' && a.fecha.startsWith(curMonthStr))
      .reduce((s, a) => s + a.monto, 0),
    [ahorros, curMonthStr]
  )

  if (sueldoEfectivo === 0) return null

  const metaMonto = sueldoEfectivo * metaAhorro.metaPct / 100
  const progresoPct = metaMonto > 0 ? (ahorradoMes / metaMonto) * 100 : 0
  const barWidth = Math.min(progresoPct, 100)

  const color = progresoPct >= 100
    ? { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    : progresoPct >= 60
    ? { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
    : { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }

  const fmt = (n) => `$${Math.round(n).toLocaleString('es')}`

  const handleSave = (e) => {
    e.preventDefault()
    const metaPct = Math.min(100, Math.max(1, parseInt(formPct) || 20))
    const sueldoBase = formSueldo.trim() !== '' ? parseFloat(formSueldo) : null
    onSave({ metaPct, sueldoBase })
    setShowConfig(false)
  }

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border ${color.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="text-gray-700 font-semibold text-sm">Meta de ahorro</h3>
        </div>
        <button
          onClick={() => setShowConfig(v => !v)}
          className="text-gray-400 hover:text-gray-600 text-base leading-none p-1"
        >
          ⚙
        </button>
      </div>

      {!showConfig && (
        <>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400">Ahorrado este mes</p>
              <p className="text-gray-800 font-bold text-lg">{fmt(ahorradoMes)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Meta ({metaAhorro.metaPct}% del sueldo)</p>
              <p className="text-gray-500 font-semibold text-sm">{fmt(metaMonto)}</p>
            </div>
          </div>

          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all ${color.bar}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>

          <p className={`text-xs font-semibold ${color.text}`}>
            {Math.round(progresoPct)}%{progresoPct >= 100 ? ' — ¡Meta cumplida!' : ` de ${fmt(metaMonto)}`}
          </p>
        </>
      )}

      {showConfig && (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">% de ahorro objetivo</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formPct}
              onChange={e => setFormPct(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Sueldo base (opcional)</label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Dejar vacío para auto-detectar"
              value={formSueldo}
              onChange={e => setFormSueldo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="text-xs text-gray-400 mt-1">Vacío = auto-detectar desde ingresos del mes</p>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 text-gray-500 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
