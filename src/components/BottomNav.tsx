import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'

const TABS = [
  { to: '/', label: 'Casa', emoji: '🏠' },
  { to: '/learn', label: 'Impara', emoji: '📚' },
  { to: '/speak', label: 'Parla', emoji: '🎙️' },
  { to: '/conversa', label: 'Chat', emoji: '💬' },
  { to: '/lens', label: 'Lens', emoji: '📷' },
  { to: '/review', label: 'Ripassa', emoji: '🔁' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur border-t border-espresso/10 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors',
                isActive ? 'text-basil' : 'text-espresso-soft',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('text-xl leading-none transition-transform', isActive && 'scale-110')}>{t.emoji}</span>
                {t.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
