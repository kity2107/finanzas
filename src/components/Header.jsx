export default function Header({ user, onSignOut }) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-lg font-bold text-gray-800">💰 Mis Finanzas</h1>
      <div className="flex items-center gap-2">
        {user?.picture && (
          <img
            src={user.picture}
            alt={user.name || 'Usuario'}
            className="w-8 h-8 rounded-full border border-gray-200"
            referrerPolicy="no-referrer"
          />
        )}
        <button
          onClick={onSignOut}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
