import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Confetti } from '../components/Confetti'
import { ProgressBar } from '../components/ProgressBar'
import { SpeakPractice } from '../components/SpeakPractice'
import { BADGES } from '../data/badges'
import { getUnit, type VocabItem } from '../data/curriculum'
import { buildLesson, isScored, type Exercise } from '../lib/exercises'
import { similarityScore } from '../lib/similarity'
import { speakItalian } from '../lib/speech'
import { cn, shuffle } from '../lib/utils'
import { useStore } from '../store/useStore'

export function Lesson() {
  const { id } = useParams()
  const unit = getUnit(id ?? '')
  const addXp = useStore((s) => s.addXp)
  const completeLesson = useStore((s) => s.completeLesson)

  const initial = useMemo(() => (unit ? buildLesson(unit) : []), [unit])
  const [queue, setQueue] = useState<Exercise[]>(initial)
  const [idx, setIdx] = useState(0)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [attempted, setAttempted] = useState<Set<number>>(new Set())
  const [finished, setFinished] = useState(false)
  const [newBadges, setNewBadges] = useState<string[]>([])
  const [xpEarned, setXpEarned] = useState(0)
  const scoredTotal = useMemo(() => initial.filter(isScored).length, [initial])

  if (!unit) return <p className="pt-8 text-center">Unit not found.</p>

  const current = queue[idx]

  function advance() {
    if (idx + 1 < queue.length) {
      setIdx(idx + 1)
    } else {
      const pct = scoredTotal > 0 ? Math.round((firstTryCorrect / scoredTotal) * 100) : 100
      const badges = completeLesson(
        unit!.id,
        pct,
        unit!.vocab.map((v) => v.id),
      )
      setNewBadges(badges)
      setXpEarned((x) => x + 20)
      setFinished(true)
    }
  }

  /** exerciseIdx identifies the original exercise position for first-try tracking */
  function handleAnswer(correct: boolean, exercise: Exercise) {
    const isFirstTry = !attempted.has(idx)
    setAttempted((prev) => new Set(prev).add(idx))
    if (correct) {
      if (isFirstTry) {
        setFirstTryCorrect((c) => c + 1)
        addXp(5)
        setXpEarned((x) => x + 5)
      }
    } else {
      // Re-queue the exercise at the end for a mastery loop.
      setQueue((q) => [...q, exercise])
    }
  }

  if (finished) {
    const pct = scoredTotal > 0 ? Math.round((firstTryCorrect / scoredTotal) * 100) : 100
    return (
      <div className="pt-10 text-center space-y-5">
        <Confetti />
        <p className="text-6xl animate-pop">{pct >= 80 ? '🏆' : pct >= 50 ? '🎉' : '💪'}</p>
        <h1 className="text-2xl font-black">Lezione completata!</h1>
        <div className="bg-paper rounded-3xl p-5 shadow-sm space-y-2 max-w-xs mx-auto">
          <p className="text-4xl font-black text-basil">{pct}%</p>
          <p className="text-sm text-espresso-soft">first-try accuracy</p>
          <p className="font-black text-gold text-lg">+{xpEarned} XP ⭐</p>
          <p className="text-xs text-espresso-soft">
            {unit.vocab.length} words added to your Review deck 🔁
          </p>
        </div>
        {newBadges.length > 0 && (
          <div className="space-y-2">
            {newBadges.map((id) => {
              const b = BADGES.find((x) => x.id === id)!
              return (
                <p key={id} className="font-bold bg-gold-light inline-block px-4 py-2 rounded-2xl animate-pop">
                  {b.emoji} New badge: {b.name}!
                </p>
              )
            })}
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <Link to={`/unit/${unit.id}`} className="bg-basil text-white rounded-2xl px-6 py-3 font-bold">
            Continue →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-2 space-y-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={idx / queue.length} className="flex-1" />
        <span className="text-xs font-black text-espresso-soft shrink-0">
          {idx + 1}/{queue.length}
        </span>
      </div>
      {current && (
        <ExerciseView
          key={`${idx}`}
          exercise={current}
          onAnswer={(ok) => handleAnswer(ok, current)}
          onNext={advance}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function ExerciseView({
  exercise,
  onAnswer,
  onNext,
}: {
  exercise: Exercise
  onAnswer: (correct: boolean) => void
  onNext: () => void
}) {
  switch (exercise.kind) {
    case 'flash':
      return <Flash item={exercise.item} onNext={onNext} />
    case 'listen-pick':
      return (
        <PickOne
          instruction="Tap what you hear 👂"
          audioText={exercise.prompt.it}
          autoPlay
          options={exercise.options.map((o) => ({
            id: o.id,
            label: exercise.mode === 'emoji' ? o.emoji : o.it,
            sub: exercise.mode === 'emoji' ? undefined : undefined,
            big: exercise.mode === 'emoji',
          }))}
          correctId={exercise.prompt.id}
          reveal={{ it: exercise.prompt.it, en: exercise.prompt.en }}
          onAnswer={onAnswer}
          onNext={onNext}
        />
      )
    case 'read-pick':
      return (
        <PickOne
          instruction={`What does “${exercise.prompt.it}” mean? 📖`}
          audioText={exercise.prompt.it}
          options={exercise.options.map((o) => ({ id: o.id, label: o.en }))}
          correctId={exercise.prompt.id}
          reveal={{ it: exercise.prompt.it, en: exercise.prompt.en }}
          onAnswer={onAnswer}
          onNext={onNext}
        />
      )
    case 'build':
      return <BuildSentence key={exercise.phrase.id} phrase={exercise.phrase} onAnswer={onAnswer} onNext={onNext} />
    case 'dictation':
      return <Dictation key={exercise.phrase.id} phrase={exercise.phrase} onAnswer={onAnswer} onNext={onNext} />
    case 'speak':
      return (
        <div className="space-y-4">
          <p className="text-center font-extrabold text-lg">Say it out loud 🎙️</p>
          <SpeakPractice
            target={exercise.phrase.it}
            english={exercise.phrase.en}
            onResult={(score) => onAnswer(score >= 60)}
          />
          <button onClick={onNext} className="w-full bg-basil text-white rounded-2xl py-3 font-bold">
            Next →
          </button>
        </div>
      )
  }
}

function Flash({ item, onNext }: { item: VocabItem; onNext: () => void }) {
  useEffect(() => {
    speakItalian(item.it)
  }, [item])
  return (
    <div className="space-y-4">
      <p className="text-center font-extrabold text-lg">New word ✨</p>
      <div className="bg-paper rounded-3xl p-8 shadow-sm text-center space-y-3 animate-pop">
        <p className="text-7xl">{item.emoji}</p>
        <p className="text-3xl font-black">{item.it}</p>
        <p className="text-espresso-soft">{item.en}</p>
        <div className="flex justify-center gap-3">
          <AudioButton text={item.it} />
          <AudioButton text={item.it} slow />
        </div>
      </div>
      <button onClick={onNext} className="w-full bg-basil text-white rounded-2xl py-3.5 font-bold text-lg">
        Got it →
      </button>
    </div>
  )
}

function PickOne({
  instruction,
  audioText,
  autoPlay = false,
  options,
  correctId,
  reveal,
  onAnswer,
  onNext,
}: {
  instruction: string
  audioText?: string
  autoPlay?: boolean
  options: Array<{ id: string; label: string; sub?: string; big?: boolean }>
  correctId: string
  reveal: { it: string; en: string }
  onAnswer: (correct: boolean) => void
  onNext: () => void
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const answeredRef = useRef(false)

  useEffect(() => {
    if (autoPlay && audioText) speakItalian(audioText)
  }, [autoPlay, audioText])

  const correct = picked === correctId

  function pick(id: string) {
    if (locked) return
    setPicked(id)
    setLocked(true)
    if (!answeredRef.current) {
      answeredRef.current = true
      onAnswer(id === correctId)
    }
    if (id === correctId) speakItalian(reveal.it)
  }

  return (
    <div className="space-y-4">
      <p className="text-center font-extrabold text-lg">{instruction}</p>
      {audioText && (
        <div className="flex justify-center gap-3">
          <AudioButton text={audioText} size="lg" />
          <AudioButton text={audioText} slow />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const state =
            picked === null ? 'idle' : o.id === correctId ? 'correct' : o.id === picked ? 'wrong' : 'dim'
          return (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              disabled={locked}
              className={cn(
                'rounded-3xl p-4 font-bold shadow-sm transition-all border-2',
                o.big ? 'text-5xl py-6' : 'text-base',
                state === 'idle' && 'bg-paper border-transparent active:scale-95',
                state === 'correct' && 'bg-basil-light border-basil animate-pop',
                state === 'wrong' && 'bg-tomato-light border-tomato animate-shake',
                state === 'dim' && 'bg-paper border-transparent opacity-40',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {locked && (
        <div className="space-y-3 animate-pop">
          <div
            className={cn(
              'rounded-2xl p-4 text-center font-bold',
              correct ? 'bg-basil-light text-basil-dark' : 'bg-tomato-light text-tomato',
            )}
          >
            {correct ? 'Bravo! 🎉' : `Not quite — it's “${reveal.it}” (${reveal.en}). It'll come around again!`}
          </div>
          <button onClick={onNext} className="w-full bg-basil text-white rounded-2xl py-3.5 font-bold text-lg">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

function BuildSentence({
  phrase,
  onAnswer,
  onNext,
}: {
  phrase: { it: string; en: string }
  onAnswer: (correct: boolean) => void
  onNext: () => void
}) {
  const words = useMemo(() => phrase.it.replace(/[.,!?]/g, '').split(/\s+/), [phrase])
  const [bank, setBank] = useState(() => shuffle(words.map((w, i) => ({ w, i }))))
  const [chosen, setChosen] = useState<Array<{ w: string; i: number }>>([])
  const [result, setResult] = useState<null | boolean>(null)

  function check() {
    const ok = chosen.map((c) => c.w).join(' ') === words.join(' ')
    setResult(ok)
    onAnswer(ok)
    if (ok) speakItalian(phrase.it)
  }

  return (
    <div className="space-y-4">
      <p className="text-center font-extrabold text-lg">Build the sentence 🧩</p>
      <div className="bg-paper rounded-3xl p-4 shadow-sm text-center">
        <p className="text-espresso-soft text-sm">English</p>
        <p className="font-extrabold text-lg">{phrase.en}</p>
      </div>
      <div className="min-h-14 bg-espresso/5 rounded-2xl p-3 flex flex-wrap gap-2">
        {chosen.map((c, pos) => (
          <button
            key={`${c.i}`}
            disabled={result !== null}
            onClick={() => {
              setChosen(chosen.filter((_, p) => p !== pos))
              setBank([...bank, c])
            }}
            className="bg-basil text-white px-3 py-1.5 rounded-xl font-bold"
          >
            {c.w}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((c) => (
          <button
            key={`${c.i}`}
            disabled={result !== null}
            onClick={() => {
              setBank(bank.filter((x) => x.i !== c.i))
              setChosen([...chosen, c])
            }}
            className="bg-paper px-3 py-1.5 rounded-xl font-bold shadow-sm active:scale-95"
          >
            {c.w}
          </button>
        ))}
      </div>
      {result === null ? (
        <button
          onClick={check}
          disabled={chosen.length !== words.length}
          className="w-full bg-basil text-white rounded-2xl py-3.5 font-bold text-lg disabled:opacity-40"
        >
          Check
        </button>
      ) : (
        <div className="space-y-3 animate-pop">
          <div
            className={cn(
              'rounded-2xl p-4 text-center font-bold',
              result ? 'bg-basil-light text-basil-dark' : 'bg-tomato-light text-tomato',
            )}
          >
            {result ? 'Perfetto! 🎉' : `The answer is: “${phrase.it}”`}
          </div>
          <button onClick={onNext} className="w-full bg-basil text-white rounded-2xl py-3.5 font-bold text-lg">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

const ACCENTS = ['à', 'è', 'é', 'ì', 'ò', 'ù']

function Dictation({
  phrase,
  onAnswer,
  onNext,
}: {
  phrase: { it: string; en: string }
  onAnswer: (correct: boolean) => void
  onNext: () => void
}) {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<null | boolean>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    speakItalian(phrase.it)
  }, [phrase])

  function check() {
    const ok = similarityScore(phrase.it, value) >= 85
    setResult(ok)
    onAnswer(ok)
  }

  return (
    <div className="space-y-4">
      <p className="text-center font-extrabold text-lg">Type what you hear ⌨️</p>
      <div className="flex justify-center gap-3">
        <AudioButton text={phrase.it} size="lg" />
        <AudioButton text={phrase.it} slow />
      </div>
      <input
        ref={inputRef}
        value={value}
        disabled={result !== null}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Scrivi in italiano…"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="w-full bg-paper rounded-2xl px-4 py-4 font-bold text-lg shadow-sm outline-none focus:ring-2 ring-basil"
      />
      <div className="flex gap-2 justify-center">
        {ACCENTS.map((a) => (
          <button
            key={a}
            disabled={result !== null}
            onClick={() => {
              setValue((v) => v + a)
              inputRef.current?.focus()
            }}
            className="w-9 h-9 bg-paper rounded-xl font-bold shadow-sm"
          >
            {a}
          </button>
        ))}
      </div>
      {result === null ? (
        <button
          onClick={check}
          disabled={!value.trim()}
          className="w-full bg-basil text-white rounded-2xl py-3.5 font-bold text-lg disabled:opacity-40"
        >
          Check
        </button>
      ) : (
        <div className="space-y-3 animate-pop">
          <div
            className={cn(
              'rounded-2xl p-4 text-center font-bold',
              result ? 'bg-basil-light text-basil-dark' : 'bg-tomato-light text-tomato',
            )}
          >
            {result ? 'Bravissimo! 🎉' : `It was: “${phrase.it}”`}
            <p className="text-xs font-normal mt-1 text-espresso-soft">({phrase.en})</p>
          </div>
          <button onClick={onNext} className="w-full bg-basil text-white rounded-2xl py-3.5 font-bold text-lg">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
