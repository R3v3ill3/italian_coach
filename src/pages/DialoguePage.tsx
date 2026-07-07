import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Confetti } from '../components/Confetti'
import { getUnit } from '../data/curriculum'
import { speakItalian, stopSpeaking } from '../lib/speech'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'

export function DialoguePage() {
  const { id } = useParams()
  const unit = getUnit(id ?? '')
  const addXp = useStore((s) => s.addXp)
  const completeDialogue = useStore((s) => s.completeDialogue)
  const speechRate = useStore((s) => s.settings.speechRate)

  const [playingLine, setPlayingLine] = useState<number | null>(null)
  const [showEnglish, setShowEnglish] = useState(false)
  const [slow, setSlow] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [done, setDone] = useState(false)
  const playAllRef = useRef(false)

  if (!unit) return <p className="pt-8 text-center">Unit not found.</p>

  const rate = slow ? speechRate * 0.62 : speechRate

  async function playAll() {
    if (playAllRef.current) {
      playAllRef.current = false
      stopSpeaking()
      setPlayingLine(null)
      return
    }
    playAllRef.current = true
    for (let i = 0; i < unit!.dialogue.length; i++) {
      if (!playAllRef.current) break
      setPlayingLine(i)
      await speakItalian(unit!.dialogue[i].it, { rate })
      await new Promise((r) => setTimeout(r, 350))
    }
    playAllRef.current = false
    setPlayingLine(null)
  }

  const allAnswered = unit.quiz.every((_, i) => answers[i] !== undefined)
  const allCorrect = unit.quiz.every((q, i) => answers[i] === q.answer)

  function finish() {
    completeDialogue(unit!.id)
    setDone(true)
  }

  return (
    <div className="space-y-4 pt-1">
      {done && <Confetti count={40} />}
      <h1 className="text-xl font-black">
        🎧 {unit.dialogueTitle}
      </h1>
      <p className="text-sm text-espresso-soft -mt-2">
        Listen first with the English hidden. Then reveal it and listen again — twice through is the trick.
      </p>

      <div className="flex gap-2">
        <button
          onClick={playAll}
          className={cn(
            'flex-1 rounded-2xl py-3 font-bold text-white',
            playAllRef.current ? 'bg-tomato' : 'bg-basil',
          )}
        >
          {playAllRef.current ? '⏹ Stop' : '▶️ Play all'}
        </button>
        <button
          onClick={() => setSlow(!slow)}
          className={cn('px-4 rounded-2xl font-bold', slow ? 'bg-gold text-espresso' : 'bg-paper shadow-sm')}
        >
          🐢 {slow ? 'Slow' : 'Normal'}
        </button>
        <button
          onClick={() => setShowEnglish(!showEnglish)}
          className={cn('px-4 rounded-2xl font-bold', showEnglish ? 'bg-sea text-white' : 'bg-paper shadow-sm')}
        >
          🇬🇧
        </button>
      </div>

      <div className="space-y-2">
        {unit.dialogue.map((line, i) => {
          const isTroy = line.speaker === 'Troy' || line.speaker === 'Marco'
          return (
            <button
              key={i}
              onClick={async () => {
                setPlayingLine(i)
                await speakItalian(line.it, { rate })
                setPlayingLine(null)
              }}
              className={cn(
                'w-full text-left rounded-2xl p-3 shadow-sm transition-all',
                isTroy ? 'bg-basil-light ml-6' : 'bg-paper mr-6',
                playingLine === i && 'ring-2 ring-gold scale-[1.01]',
              )}
            >
              <p className="text-[10px] font-black uppercase tracking-wide text-espresso-soft">{line.speaker}</p>
              <p className="font-bold">{line.it}</p>
              {showEnglish && <p className="text-sm text-espresso-soft mt-0.5">{line.en}</p>}
            </button>
          )
        })}
      </div>

      <div className="bg-paper rounded-3xl p-4 shadow-sm space-y-4">
        <p className="font-extrabold">Did you catch it? 🧐</p>
        {unit.quiz.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <p className="font-bold text-sm">{q.q}</p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const picked = answers[qi]
                const state =
                  picked === undefined ? 'idle' : oi === q.answer && picked === oi ? 'correct' : picked === oi ? 'wrong' : 'idle'
                return (
                  <button
                    key={oi}
                    onClick={() => {
                      if (answers[qi] !== undefined) return
                      setAnswers({ ...answers, [qi]: oi })
                      if (oi === q.answer) addXp(5)
                    }}
                    className={cn(
                      'w-full text-left rounded-xl px-3 py-2 text-sm font-semibold border-2 transition-all',
                      state === 'idle' && 'bg-cream border-transparent',
                      state === 'correct' && 'bg-basil-light border-basil',
                      state === 'wrong' && 'bg-tomato-light border-tomato',
                    )}
                  >
                    {opt}
                    {state === 'wrong' && <span className="block text-xs font-normal">Correct: {q.options[q.answer]}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {allAnswered && !done && (
          <button onClick={finish} className="w-full bg-basil text-white rounded-2xl py-3 font-bold animate-pop">
            {allCorrect ? 'Perfetto — finish! 🎉' : 'Finish (+15 XP)'}
          </button>
        )}
        {done && (
          <div className="text-center space-y-3 animate-pop">
            <p className="font-black text-basil text-lg">+15 XP · Dialogue done! 🎉</p>
            <Link to={`/unit/${unit.id}`} className="inline-block bg-espresso text-cream rounded-2xl px-6 py-2.5 font-bold">
              Back to unit →
            </Link>
          </div>
        )}
      </div>

      <div className="bg-sea-light rounded-2xl p-3">
        <p className="text-sm">
          💬 <strong>Practice tip:</strong> pick a line and say it aloud on the{' '}
          <Link to="/speak" className="underline font-bold">
            Parla
          </Link>{' '}
          tab.
        </p>
      </div>
    </div>
  )
}
