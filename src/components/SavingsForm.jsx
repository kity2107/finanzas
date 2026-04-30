import { useState } from 'react'
import { addAhorro } from '../utils/sheetsApi'

const DESTINOS = [
  { label: 'Emergencias', emoji: '🛡️' },
  { label: 'Vacaciones',  emoji: '✈️' },
  { label: 'Auto',        emoji: '🚗' },
  { label: 'Casa',        emoji: '🏠' },
  { label: 'Educación',   emoji: '📚' },
  { label: 'Inversión',   emoji: '📈' },
  { label: 'Tecnología',  emoji: '💻' },
  { label: 'General',     emoji: '🏦' },
]

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function SavingsForm({ token, spreadsheetId, onAdd }) {
  const [form, setForm] = useState({
    fecha: todayStr(),
    descripcion: '',
    monto: '',
    tipo: 'deposito',
    destino: 'General',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.monto || !form.descripcion.trim()) return
    setLoading(true)
    setError(null)
    try {
      const ahorro = await addAhorro(token, spreadsheetId, {
        ...form,
        monto: parseFloat(form.monto),
      })
      onAdd(ahorro)
      setSuccess(true)
      setForm({ fecha: todayStr(), descripcion: '', monto: '', tipo: 'deposito', destino: 'General' })
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Movimiento de ahorros</h2>

      {success && (
        <div className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-xl text-violet-700 text-sm text-center font-medium">
          ✓ Movimiento guardado en Google Sheets
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipo */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            {[['deposito', '⬆️ Depósito'], ['retiro', '⬇️ Retiro']].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => set('tipo', val)}
                className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                  form.tipo === val
                    ? val === 'deposito'
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Destino */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Destino</label>
          <div className="grid grid-cols-4 gap-2">
            {DESTINOS.map(({ label, emoji }) => (
              <button
                key={label}
                type="button"
                onClick={() => set('destino', label)}
                className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                  form.destino === label
                    ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                }`}
              >
                <span className="block text-base mb-0.5">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

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
              className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-gray-200 text-xl font-bold focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Descripción</label>
          <input
            type="text"
            placeholder="Ej: Ahorro mensual, Cuota auto..."
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
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
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-violet-500 text-white font-semibold rounded-xl hover:bg-violet-600 active:scale-[0.98] transition-all disabled:opacity-60 text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </span>
          ) : 'Guardar movimiento'}
        </button>
      </form>
    </div>
  )
}
