import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Confetti } from '../components/Confetti'
import { getUnit } from '../data/curriculum'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'

export function ReadingPage() {
  const { id } = useParams()
  const unit = getUnit(id ?? '')
  const completeReading = useStore((s) => s.completeReading)
  const readingsDone = useStore((s) => s.readingsDone)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)

  if (!unit) return <p className="pt-8 text-center">Unit not found.</p>
  const alreadyDone = !!readingsDone[unit.id]

  return (
    <div className="space-y-4 pt-1">
      {done && <Confetti count={40} />}
      <h1 className="text-xl font-black">📖 {unit.reading.title}</h1>
      <p className="text-sm text-espresso-soft -mt-2">
        Read each sentence aloud in your head (or out loud!). Tap a sentence to check the English — try not to peek
        until you've had a real go.
      </p>

      <div className="bg-paper rounded-3xl p-5 shadow-sm space-y-4">
        {unit.reading.sentences.map((s, i) => {
          const isOpen = revealed.has(i)
          return (
            <div key={i} className="flex gap-3 items-start">
              <AudioButton text={s.it} size="sm" className="mt-0.5" />
              <button
                onClick={() => {
                  const next = new Set(revealed)
                  if (isOpen) next.delete(i)
                  else next.add(i)
                  setRevealed(next)
                }}
                className="flex-1 text-left"
              >
                <p className="font-bold leading-relaxed">{s.it}</p>
                <p
                  className={cn(
                    'text-sm text-espresso-soft transition-all',
                    isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden',
                  )}
                >
                  {s.en}
                </p>
                {!isOpen && <p className="text-[10px] text-espresso-soft/60 font-bold">tap to reveal</p>}
              </button>
            </div>
          )
        })}
      </div>

      {!done && !alreadyDone && (
        <button
          onClick={() => {
            completeReading(unit.id)
            setDone(true)
          }}
          className="w-full bg-basil text-white rounded-2xl py-3.5 font-bold text-lg"
        >
          I read it! (+15 XP) ✓
        </button>
      )}
      {(done || alreadyDone) && (
        <div className="text-center space-y-3">
          {done && <p className="font-black text-basil text-lg animate-pop">+15 XP · Ottima lettura! 🎉</p>}
          <Link to={`/unit/${unit.id}`} className="inline-block bg-espresso text-cream rounded-2xl px-6 py-2.5 font-bold">
            Back to unit →
          </Link>
        </div>
      )}
    </div>
  )
}
