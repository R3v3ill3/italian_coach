import { useEffect, useRef, useState } from 'react'
import { coachFeedback, resolveAi } from '../lib/ai'
import { diffWords, pronunciationTips, similarityScore, type WordDiffEntry } from '../lib/similarity'
import { listenItalian, sttSupported, type ListenSession } from '../lib/speech'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'
import { AudioButton } from './AudioButton'
import { WordDiff } from './WordDiff'

type Status = 'idle' | 'listening' | 'scored'

export function SpeakPractice({
  target,
  english,
  onResult,
  autoFocusTarget = true,
}: {
  target: string
  english?: string
  onResult?: (score: number) => void
  autoFocusTarget?: boolean
}) {
  const settings = useStore((s) => s.settings)
  const ai = resolveAi(settings)
  const aiReady = useStore((s) => s.aiReady)
  const recordSpeak = useStore((s) => s.recordSpeak)

  const [status, setStatus] = useState<Status>('idle')
  const [interim, setInterim] = useState('')
  const [heard, setHeard] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [diff, setDiff] = useState<WordDiffEntry[]>([])
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const sessionRef = useRef<ListenSession | null>(null)

  const supported = sttSupported()
  const tips = pronunciationTips(target)

  useEffect(() => {
    setStatus('idle')
    setInterim('')
    setHeard('')
    setScore(null)
    setDiff([])
    setAiText('')
    setError('')
    return () => sessionRef.current?.abort()
  }, [target])

  function finish(finalText: string) {
    const s = similarityScore(target, finalText)
    setHeard(finalText)
    setScore(s)
    setDiff(diffWords(target, finalText))
    setStatus('scored')
    recordSpeak(s)
    onResult?.(s)
  }

  function startListening() {
    setError('')
    setInterim('')
    setAiText('')
    setStatus('listening')
    const session = listenItalian({
      onInterim: setInterim,
      onFinal: finish,
      onError: (err) => {
        setStatus('idle')
        setError(
          err === 'not-allowed'
            ? 'Microphone access was blocked — allow it in your browser settings.'
            : err === 'no-speech'
              ? "I didn't hear anything — try again, a little louder."
              : `Speech recognition error: ${err}`,
        )
      },
      onEnd: () => {
        setStatus((s) => (s === 'listening' ? 'idle' : s))
      },
    })
    sessionRef.current = session
  }

  function selfRate(s: number) {
    setScore(s)
    setStatus('scored')
    recordSpeak(s)
    onResult?.(s)
  }

  async function askCoach() {
    if (!aiReady || score === null) return
    setAiLoading(true)
    setAiText('')
    try {
      const text = await coachFeedback(ai, { target, english: english ?? '', heard, score })
      setAiText(text)
    } catch (e) {
      setAiText(`Coach unavailable: ${e instanceof Error ? e.message : 'unknown error'}`)
    } finally {
      setAiLoading(false)
    }
  }

  const band =
    score === null ? null : score >= 90 ? 'Perfetto! 🌟' : score >= 75 ? 'Molto bene! 👏' : score >= 60 ? 'Quasi! Riprova 💪' : 'Buon tentativo — ascolta e riprova 🎧'

  return (
    <div className="space-y-4">
      {/* Target phrase */}
      <div className={cn('bg-paper rounded-3xl p-5 shadow-sm text-center space-y-2', autoFocusTarget && 'animate-pop')}>
        <p className="text-2xl font-extrabold leading-snug">{target}</p>
        {english && <p className="text-espresso-soft">{english}</p>}
        <div className="flex justify-center gap-3 pt-1">
          <AudioButton text={target} />
          <AudioButton text={target} slow />
        </div>
      </div>

      {/* Mic */}
      {supported ? (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => (status === 'listening' ? sessionRef.current?.stop() : startListening())}
            className={cn(
              'w-20 h-20 rounded-full text-3xl flex items-center justify-center shadow-lg transition-all active:scale-90',
              status === 'listening' ? 'bg-tomato text-white animate-pulse-ring' : 'bg-basil text-white',
            )}
          >
            {status === 'listening' ? '⏹' : '🎙️'}
          </button>
          <p className="text-sm text-espresso-soft font-semibold">
            {status === 'listening' ? (interim ? `“${interim}”` : 'Listening… speak now') : 'Tap and say the phrase'}
          </p>
        </div>
      ) : (
        <div className="bg-gold-light rounded-2xl p-4 text-sm space-y-3">
          <p>
            🎧 Speech recognition isn’t available in this browser (try Safari on iPhone or Chrome on desktop). Listen,
            repeat aloud, then rate yourself honestly:
          </p>
          <div className="flex gap-2">
            <button onClick={() => selfRate(90)} className="flex-1 bg-basil text-white rounded-xl py-2 font-bold">Nailed it</button>
            <button onClick={() => selfRate(75)} className="flex-1 bg-gold text-espresso rounded-xl py-2 font-bold">Close</button>
            <button onClick={() => selfRate(50)} className="flex-1 bg-tomato text-white rounded-xl py-2 font-bold">Again</button>
          </div>
        </div>
      )}

      {error && <p className="text-center text-sm text-tomato font-semibold">{error}</p>}

      {/* Result */}
      {status === 'scored' && score !== null && (
        <div className="bg-paper rounded-3xl p-5 shadow-sm space-y-4 animate-pop">
          <div className="text-center space-y-1">
            <p
              className={cn(
                'text-4xl font-black',
                score >= 90 ? 'text-basil' : score >= 60 ? 'text-gold' : 'text-tomato',
              )}
            >
              {score}%
            </p>
            <p className="font-bold">{band}</p>
            {heard && <p className="text-sm text-espresso-soft">Heard: “{heard}”</p>}
          </div>

          {diff.length > 0 && <WordDiff entries={diff} />}

          {tips.length > 0 && (
            <div className="bg-sea-light rounded-2xl p-3 space-y-1">
              {tips.map((t, i) => (
                <p key={i} className="text-sm">💡 {t}</p>
              ))}
            </div>
          )}

          {aiReady ? (
            <div className="space-y-2">
              {!aiText && (
                <button
                  onClick={askCoach}
                  disabled={aiLoading}
                  className="w-full bg-espresso text-cream rounded-2xl py-3 font-bold disabled:opacity-60"
                >
                  {aiLoading ? 'Coach Gio is listening… 🎧' : 'Ask Coach Gio for feedback 🇮🇹'}
                </button>
              )}
              {aiText && (
                <div className="bg-gold-light rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed">
                  <p className="font-black mb-1">👨‍🏫 Coach Gio</p>
                  {aiText}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-center text-espresso-soft">
              AI coaching isn’t switched on for this app. See Settings ⚙️ for details.
            </p>
          )}

          <button
            onClick={() => {
              setStatus('idle')
              setScore(null)
              setDiff([])
              setHeard('')
              setAiText('')
            }}
            className="w-full border-2 border-basil text-basil rounded-2xl py-2.5 font-bold"
          >
            Try again 🔁
          </button>
        </div>
      )}
    </div>
  )
}
