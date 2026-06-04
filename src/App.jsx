import { useState, useEffect } from 'react'
import { loadGoogleIdentityServices, getAccessToken, getUserInfo } from './utils/googleAuth'
import {
  findOrCreateSpreadsheet, ensureExtraSheets,
  loadExpenses, loadIngresos, loadAhorros, loadGastosFijos,
  ensureCuotasSheet, getCuotas, saveCuota, saveGastosBatch,
} from './utils/sheetsApi'
import Login from './components/Login'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ExpenseForm from './components/ExpenseForm'
import IncomeForm from './components/IncomeForm'
import SavingsForm from './components/SavingsForm'
import ExpenseList from './components/ExpenseList'
import FixedExpensesList from './components/FixedExpensesList'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function App() {
  const [token, setToken] = useState(null)
  const [spreadsheetId, setSpreadsheetId] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [ingresos, setIngresos] = useState([])
  const [ahorros, setAhorros] = useState([])
  const [gastosFijos, setGastosFijos] = useState([])
  const [cuotas, setCuotas] = useState([])
  const [view, setView] = useState('dashboard')
  const [addTab, setAddTab] = useState('expense')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    loadGoogleIdentityServices()

    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallBanner(false)
      setInstallPrompt(null)
    }
  }

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const accessToken = await getAccessToken(CLIENT_ID)
      const userInfo = await getUserInfo(accessToken)
      const sheetId = await findOrCreateSpreadsheet(accessToken)
      await ensureExtraSheets(accessToken, sheetId)
      await ensureCuotasSheet(accessToken, sheetId)
      const [expData, ingData, ahoData, fijosData, cuotasData] = await Promise.all([
        loadExpenses(accessToken, sheetId),
        loadIngresos(accessToken, sheetId),
        loadAhorros(accessToken, sheetId),
        loadGastosFijos(accessToken, sheetId),
        getCuotas(accessToken, sheetId),
      ])

      setToken(accessToken)
      setUser(userInfo)
      setSpreadsheetId(sheetId)
      setExpenses(expData)
      setIngresos(ingData)
      setAhorros(ahoData)
      setGastosFijos(fijosData)
      setCuotas(cuotasData)
    } catch (err) {
      console.error(err)
      setError('No se pudo conectar. Verifica que el Client ID sea correcto.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = (expense) => {
    setExpenses(prev => [...prev, expense].sort((a, b) => b.fecha.localeCompare(a.fecha)))
    setView('dashboard')
  }

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const handleEditExpense = (updated) => {
    setExpenses(prev =>
      prev.map(e => e.id === updated.id ? updated : e)
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
    )
  }

  const handleAddCuota = async ({ descripcion, monto, categoria, fecha, cuotasTotal }) => {
    const id = Date.now().toString()
    const montoCuota = parseFloat((monto / cuotasTotal).toFixed(2))
    const cuota = {
      id,
      descripcion,
      montoTotal: monto,
      montoCuota,
      cuotasTotal,
      cuotaActual: 0,
      fechaInicio: fecha,
      categoria,
      estado: 'activa',
    }

    // Generar array de N gastos, uno por mes
    const [year, month, day] = fecha.split('-').map(Number)
    const gastos = Array.from({ length: cuotasTotal }, (_, i) => {
      const d = new Date(year, month - 1 + i, 1)
      const fechaCuota = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
      return {
        fecha: fechaCuota,
        categoria,
        descripcion: `${descripcion} - cuota ${i + 1}/${cuotasTotal}`,
        monto: montoCuota,
        id: `${id}_${i + 1}`,
      }
    })

    try {
      await saveCuota(token, spreadsheetId, cuota)
      await saveGastosBatch(token, spreadsheetId, gastos)
      setCuotas(prev => [...prev, cuota])
      setExpenses(prev => [...prev, ...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha)))
      setView('dashboard')
      return { success: true, count: cuotasTotal }
    } catch (err) {
      console.error(err)
      return { success: false }
    }
  }

  const handleAddIngreso = (ingreso) => {
    setIngresos(prev => [...prev, ingreso].sort((a, b) => b.fecha.localeCompare(a.fecha)))
    setView('dashboard')
  }

  const handleAddAhorro = (ahorro) => {
    setAhorros(prev => [...prev, ahorro].sort((a, b) => b.fecha.localeCompare(a.fecha)))
    setView('dashboard')
  }

  const handleSignOut = () => {
    setToken(null)
    setUser(null)
    setExpenses([])
    setIngresos([])
    setAhorros([])
    setGastosFijos([])
    setCuotas([])
    setSpreadsheetId(null)
    setView('dashboard')
  }

  if (!token) {
    return <Login onLogin={handleLogin} loading={loading} error={error} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      <Header user={user} onSignOut={handleSignOut} />

      {showInstallBanner && (
        <div className="bg-emerald-500 text-white px-4 py-2.5 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Instalar app en tu celular</span>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-emerald-200 hover:text-white text-xs px-2 py-1"
            >
              Ahora no
            </button>
            <button
              onClick={handleInstall}
              className="bg-white text-emerald-600 text-xs font-semibold px-3 py-1 rounded-lg"
            >
              Instalar
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-24">
        {view === 'dashboard' && (
          <Dashboard expenses={expenses} ingresos={ingresos} ahorros={ahorros} cuotas={cuotas} />
        )}

        {view === 'add' && (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white px-4 pt-4">
              {[
                ['expense', '💸 Gasto'],
                ['income',  '💰 Ingreso'],
                ['savings', '🏦 Ahorro'],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setAddTab(tab)}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    addTab === tab
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {addTab === 'expense' && (
              <ExpenseForm token={token} spreadsheetId={spreadsheetId} onAdd={handleAddExpense} onAddCuota={handleAddCuota} />
            )}
            {addTab === 'income' && (
              <IncomeForm token={token} spreadsheetId={spreadsheetId} onAdd={handleAddIngreso} />
            )}
            {addTab === 'savings' && (
              <SavingsForm token={token} spreadsheetId={spreadsheetId} onAdd={handleAddAhorro} />
            )}
          </div>
        )}

        {view === 'history' && (
          <ExpenseList
            expenses={expenses}
            ingresos={ingresos}
            token={token}
            spreadsheetId={spreadsheetId}
            onDelete={handleDeleteExpense}
            onEdit={handleEditExpense}
            onDeleteIngreso={(id) => setIngresos(prev => prev.filter(i => i.id !== id))}
          />
        )}

        {view === 'fixed' && (
          <FixedExpensesList
            gastosFijos={gastosFijos}
            token={token}
            spreadsheetId={spreadsheetId}
            onAdd={(g) => setGastosFijos(prev => [...prev, g])}
            onEdit={(g) => setGastosFijos(prev => prev.map(x => x.id === g.id ? g : x))}
            onDelete={(id) => setGastosFijos(prev => prev.filter(x => x.id !== id))}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex shadow-lg">
        <button
          onClick={() => setView('dashboard')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            view === 'dashboard' ? 'text-emerald-600' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Inicio
        </button>

        <button
          onClick={() => setView('add')}
          className="flex-1 py-2 flex flex-col items-center justify-center"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-5 shadow-lg transition-colors ${
            view === 'add' ? 'bg-emerald-600' : 'bg-emerald-500'
          }`}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className={`text-xs font-medium mt-1 ${view === 'add' ? 'text-emerald-600' : 'text-gray-400'}`}>
            Agregar
          </span>
        </button>

        <button
          onClick={() => setView('history')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            view === 'history' ? 'text-emerald-600' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Historial
        </button>

        <button
          onClick={() => setView('fixed')}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
            view === 'fixed' ? 'text-emerald-600' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Fijos
        </button>
      </nav>
    </div>
  )
}
