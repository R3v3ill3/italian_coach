import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SpeakPractice } from '../components/SpeakPractice'
import { UNITS, type Phrase } from '../data/curriculum'
import { shuffle } from '../lib/utils'
import { useStore } from '../store/useStore'

export function Speak() {
  const location = useLocation()
  const customText = (location.state as { text?: string; en?: string } | null)?.text
  const lessonScores = useStore((s) => s.lessonScores)

  // Phrase pool: units you've started (or unit 1 if nothing yet).
  const pool = useMemo<Phrase[]>(() => {
    const started = UNITS.filter((u) => (lessonScores[u.id] ?? 0) > 0)
    const units = started.length > 0 ? started : [UNITS[0]]
    return shuffle(units.flatMap((u) => u.phrases))
  }, [lessonScores])

  const [i, setI] = useState(0)
  const [useCustom, setUseCustom] = useState(!!customText)

  const phrase = pool[i % pool.length]
  const target = useCustom && customText ? customText : phrase.it
  const english = useCustom && customText ? (location.state as { en?: string })?.en : phrase.en

  return (
    <div className="space-y-4 pt-1">
      <h1 className="text-2xl font-black">Parla! 🎙️</h1>
      <p className="text-sm text-espresso-soft -mt-2">
        Listen, then say it. You'll get a score, a word-by-word breakdown, and coaching on the tricky sounds.
      </p>

      {customText && (
        <div className="flex gap-2">
          <button
            onClick={() => setUseCustom(true)}
            className={`flex-1 rounded-2xl py-2 font-bold text-sm ${useCustom ? 'bg-basil text-white' : 'bg-paper shadow-sm'}`}
          >
            📷 From Lens
          </button>
          <button
            onClick={() => setUseCustom(false)}
            className={`flex-1 rounded-2xl py-2 font-bold text-sm ${!useCustom ? 'bg-basil text-white' : 'bg-paper shadow-sm'}`}
          >
            📚 Course phrases
          </button>
        </div>
      )}

      <SpeakPractice target={target} english={english} />

      {!useCustom && (
        <button
          onClick={() => setI(i + 1)}
          className="w-full border-2 border-espresso/20 text-espresso rounded-2xl py-3 font-bold"
        >
          Another phrase 🎲
        </button>
      )}
    </div>
  )
}
