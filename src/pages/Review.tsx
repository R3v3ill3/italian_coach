import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Confetti } from '../components/Confetti'
import { vocabById } from '../data/curriculum'
import { isDue, type ReviewGrade } from '../lib/srs'
import { speakItalian } from '../lib/speech'
import { useStore } from '../store/useStore'

export function Review() {
  const srs = useStore((s) => s.srs)
  const reviewCard = useStore((s) => s.reviewCard)

  const initialDue = useMemo(() => Object.values(srs).filter(isDue).map((c) => c.id), [])
  const [queue, setQueue] = useState<string[]>(initialDue)
  const [revealed, setRevealed] = useState(false)
  const [doneCount, setDoneCount] = useState(0)

  const totalCards = Object.keys(srs).length
  const currentId = queue[0]
  const current = currentId ? vocabById(currentId) : undefined

  function grade(g: ReviewGrade) {
    if (!currentId) return
    reviewCard(currentId, g)
    setRevealed(false)
    setDoneCount((c) => c + 1)
    setQueue((q) => {
      const rest = q.slice(1)
      // "Again" cards come back at the end of this session.
      return g === 'again' ? [...rest, currentId] : rest
    })
  }

  if (totalCards === 0) {
    return (
      <div className="pt-16 text-center space-y-4">
        <p className="text-6xl">🌱</p>
        <h1 className="text-xl font-black">Nothing to review yet</h1>
        <p className="text-sm text-espresso-soft px-8">
          Words you learn in lessons land here, then come back for review right before you'd forget them.
        </p>
        <Link to="/learn" className="inline-block bg-basil text-white rounded-2xl px-6 py-3 font-bold">
          Start a lesson →
        </Link>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="pt-16 text-center space-y-4">
        {doneCount > 0 && <Confetti count={40} />}
        <p className="text-6xl">{doneCount > 0 ? '🧠✨' : '😌'}</p>
        <h1 className="text-xl font-black">
          {doneCount > 0 ? `${doneCount} review${doneCount === 1 ? '' : 's'} done!` : 'All caught up!'}
        </h1>
        <p className="text-sm text-espresso-soft px-8">
          {totalCards} word{totalCards === 1 ? '' : 's'} in your deck. Come back tomorrow — spacing is the magic.
        </p>
        <Link to="/learn" className="inline-block bg-basil text-white rounded-2xl px-6 py-3 font-bold">
          Learn more words →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Ripassa 🔁</h1>
        <span className="text-sm font-black text-espresso-soft">{queue.length} left</span>
      </div>

      <div className="bg-paper rounded-3xl p-8 shadow-sm text-center space-y-4 min-h-72 flex flex-col justify-center">
        <p className="text-6xl">{current.item.emoji}</p>
        <p className="text-espresso-soft font-bold">{current.item.en}</p>
        {revealed ? (
          <div className="space-y-3 animate-pop">
            <p className="text-3xl font-black">{current.item.it}</p>
            <div className="flex justify-center gap-3">
              <AudioButton text={current.item.it} />
              <AudioButton text={current.item.it} slow />
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setRevealed(true)
              speakItalian(current.item.it)
            }}
            className="bg-basil text-white rounded-2xl px-8 py-3 font-bold mx-auto"
          >
            Say it, then reveal 👀
          </button>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-4 gap-2 animate-pop">
          <button onClick={() => grade('again')} className="bg-tomato text-white rounded-2xl py-3 font-bold text-sm">
            Again
          </button>
          <button onClick={() => grade('hard')} className="bg-gold text-espresso rounded-2xl py-3 font-bold text-sm">
            Hard
          </button>
          <button onClick={() => grade('good')} className="bg-basil text-white rounded-2xl py-3 font-bold text-sm">
            Good
          </button>
          <button onClick={() => grade('easy')} className="bg-sea text-white rounded-2xl py-3 font-bold text-sm">
            Easy
          </button>
        </div>
      )}
      <p className="text-xs text-center text-espresso-soft">
        Think of the Italian <em>before</em> revealing — the effort of retrieval is what builds the memory.
      </p>
    </div>
  )
}
