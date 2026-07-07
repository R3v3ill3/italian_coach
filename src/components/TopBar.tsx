import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export function TopBar() {
  const xp = useStore((s) => s.xp)
  const streak = useStore((s) => s.streak)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        {isHome ? (
          <span className="font-black text-lg tracking-tight">
            Parla! <span aria-hidden>🇮🇹</span>
          </span>
        ) : (
          <button onClick={() => navigate(-1)} className="font-black text-lg flex items-center gap-1 text-espresso">
            ← <span className="text-sm font-bold text-espresso-soft">Back</span>
          </button>
        )}
        <div className="flex items-center gap-2 text-sm font-black">
          <span className="bg-tomato-light text-tomato px-2.5 py-1 rounded-full">🔥 {streak}</span>
          <span className="bg-gold-light text-espresso px-2.5 py-1 rounded-full">⭐ {xp}</span>
          <Link to="/settings" aria-label="Settings" className="text-lg pl-1">
            ⚙️
          </Link>
        </div>
      </div>
    </header>
  )
}
