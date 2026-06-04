import { useState } from 'react'
import { addExpense } from '../utils/sheetsApi'

const CUOTAS_OPTIONS = [1, 3, 6, 12, 18, 24]

const CATEGORIES = [
  'Alimentación', 'Transporte', 'Entretenimiento', 'Salud',
  'Educación', 'Hogar', 'Ropa', 'Servicios', 'Otros',
]

const CATEGORY_EMOJIS = {
  'Alimentación': '🍔', 'Transporte': '🚌', 'Entretenimiento': '🎬',
  'Salud': '💊', 'Educación': '📚', 'Hogar': '🏠',
  'Ropa': '👕', 'Servicios': '💡', 'Otros': '💰',
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function ExpenseForm({ token, spreadsheetId, onAdd, onAddCuota }) {
  const [form, setForm] = useState({
    fecha: todayStr(),
    categoria: 'Alimentación',
    descripcion: '',
    monto: '',
  })
  const [pagoConTarjeta, setPagoConTarjeta] = useState(false)
  const [cuotasTotal, setCuotasTotal] = useState(3)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState(null)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.monto || !form.descripcion.trim()) return

    setLoading(true)
    setError(null)
    try {
      if (pagoConTarjeta) {
        const result = await onAddCuota({
          ...form,
          monto: parseFloat(form.monto),
          cuotasTotal,
        })
        if (result?.success) {
          setSuccessMsg(`✓ ${cuotasTotal} cuota${cuotasTotal > 1 ? 's' : ''} registrada${cuotasTotal > 1 ? 's' : ''}`)
          setSuccess(true)
          setForm({ fecha: todayStr(), categoria: 'Alimentación', descripcion: '', monto: '' })
          setPagoConTarjeta(false)
          setCuotasTotal(3)
          setTimeout(() => setSuccess(false), 2500)
        } else {
          setError('No se pudo guardar. Intenta de nuevo.')
        }
      } else {
        const expense = await addExpense(token, spreadsheetId, {
          ...form,
          monto: parseFloat(form.monto),
        })
        onAdd(expense)
        setSuccessMsg('✓ Gasto guardado en Google Sheets')
        setSuccess(true)
        setForm({ fecha: todayStr(), categoria: 'Alimentación', descripcion: '', monto: '' })
        setTimeout(() => setSuccess(false), 2500)
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Nuevo gasto</h2>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm text-center font-medium">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Monto */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Monto</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">$</span>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={form.monto}
              onChange={e => set('monto', e.target.value)}
              className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-gray-200 text-xl font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Categoría</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => set('categoria', cat)}
                className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                  form.categoria === cat
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                }`}
              >
                <span className="block text-base mb-0.5">{CATEGORY_EMOJIS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Descripción</label>
          <input
            type="text"
            placeholder="Ej: Almuerzo, Metro, Netflix..."
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
            required
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Fecha</label>
          <input
            type="date"
            value={form.fecha}
            onChange={e => set('fecha', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
          />
        </div>

        {/* Pago con tarjeta */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setPagoConTarjeta(v => !v)}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${pagoConTarjeta ? 'bg-emerald-500' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${pagoConTarjeta ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Pago con tarjeta en cuotas</span>
          </label>

          {pagoConTarjeta && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Cantidad de cuotas</label>
                <div className="flex gap-2 flex-wrap">
                  {CUOTAS_OPTIONS.map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCuotasTotal(n)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        cuotasTotal === n
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>
              {form.monto && (
                <p className="text-sm text-gray-500">
                  {cuotasTotal} cuota{cuotasTotal > 1 ? 's' : ''} de{' '}
                  <span className="font-semibold text-emerald-600">
                    ${(parseFloat(form.monto) / cuotasTotal).toLocaleString('es', { maximumFractionDigits: 2 })}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-60 text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </span>
          ) : pagoConTarjeta ? `Guardar en ${cuotasTotal} cuota${cuotasTotal > 1 ? 's' : ''}` : 'Guardar gasto'}
        </button>
      </form>
    </div>
  )
}
