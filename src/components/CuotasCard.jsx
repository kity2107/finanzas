import { useMemo } from 'react'

function monthsDiff(fechaInicio) {
  const [y, m] = fechaInicio.split('-').map(Number)
  const now = new Date()
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m)
}

function nextMonthStr() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function CuotasCard({ cuotas }) {
  const now = new Date()
  const curYear = now.getFullYear()
  const curMonth = now.getMonth() + 1

  const stats = useMemo(() => {
    let totalAdeudado = 0
    let proximoMes = 0
    let activas = 0

    cuotas.forEach(c => {
      const pagadas = Math.min(Math.max(monthsDiff(c.fechaInicio), 0), c.cuotasTotal)
      const restantes = c.cuotasTotal - pagadas
      if (restantes <= 0) return

      activas++
      totalAdeudado += c.montoCuota * restantes

      // cuota del mes siguiente
      const [y, m] = c.fechaInicio.split('-').map(Number)
      const cuotasMes = (curYear - y) * 12 + (curMonth + 1 - m)
      if (cuotasMes > 0 && cuotasMes <= c.cuotasTotal) {
        proximoMes += c.montoCuota
      }
    })

    return { totalAdeudado, proximoMes, activas }
  }, [cuotas, curYear, curMonth])

  if (stats.activas === 0) return null

  const fmt = (n) => `$${Math.round(n).toLocaleString('es')}`

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-orange-400">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💳</span>
        <h3 className="text-gray-700 font-semibold text-sm">Compromisos de tarjeta</h3>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-xs text-gray-400">Total adeudado</p>
          <p className="text-orange-600 font-bold text-lg">{fmt(stats.totalAdeudado)}</p>
        </div>
        {stats.proximoMes > 0 && (
          <div className="flex-1">
            <p className="text-xs text-gray-400">Próximo mes</p>
            <p className="text-gray-700 font-bold text-lg">{fmt(stats.proximoMes)}</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {stats.activas} cuota{stats.activas > 1 ? 's' : ''} activa{stats.activas > 1 ? 's' : ''}
      </p>
    </div>
  )
}
