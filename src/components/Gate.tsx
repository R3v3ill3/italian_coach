import { useEffect, useState, type ReactNode } from 'react'
import { checkAiHealth } from '../lib/ai'
import { useStore } from '../store/useStore'

type Phase = 'checking' | 'locked' | 'open'

/**
 * Wraps the app. Asks the proxy whether a passcode is required; if so and the
 * stored one doesn't match, shows a passcode screen. Sets the runtime aiReady
 * flag once resolved. If the backend is unreachable, the app still opens (the
 * free course works offline) — only the AI features stay off.
 */
export function Gate({ children }: { children: ReactNode }) {
  const passcode = useStore((s) => s.settings.passcode)
  const updateSettings = useStore((s) => s.updateSettings)
  const setAiReady = useStore((s) => s.setAiReady)

  const [phase, setPhase] = useState<Phase>('checking')
  const [entry, setEntry] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    checkAiHealth(passcode).then((h) => {
      if (cancelled) return
      if (h.requiresPasscode && !h.ok) {
        setPhase('locked')
      } else {
        setAiReady(h.ok && h.configured)
        setPhase('open')
      }
    })
    return () => {
      cancelled = true
    }
    // Only run on first mount; passcode changes are handled by submit().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!entry.trim() || busy) return
    setBusy(true)
    setError('')
    const h = await checkAiHealth(entry.trim())
    setBusy(false)
    if (h.ok) {
      updateSettings({ passcode: entry.trim() })
      setAiReady(h.configured)
      setPhase('open')
    } else {
      setError('That passcode didn’t work. Try again.')
    }
  }

  if (phase === 'checking') {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-4xl animate-pulse">🇮🇹</p>
      </div>
    )
  }

  if (phase === 'locked') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-6xl">🔒</p>
        <h1 className="text-2xl font-black">Parla!</h1>
        <p className="text-sm text-espresso-soft max-w-xs">Enter the passcode to open the app.</p>
        <form onSubmit={submit} className="w-full max-w-xs space-y-3">
          <input
            type="password"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Passcode"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full bg-cream rounded-2xl px-4 py-3 text-center font-bold outline-none focus:ring-2 ring-basil"
          />
          {error && <p className="text-sm text-tomato font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-basil text-white rounded-2xl py-3 font-black disabled:opacity-60"
          >
            {busy ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  return <>{children}</>
}
