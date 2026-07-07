import { Link } from 'react-router-dom'
import { UNITS } from '../data/curriculum'
import { ProgressBar } from '../components/ProgressBar'
import { useStore } from '../store/useStore'

export function Learn() {
  const lessonScores = useStore((s) => s.lessonScores)
  const dialoguesDone = useStore((s) => s.dialoguesDone)
  const readingsDone = useStore((s) => s.readingsDone)

  return (
    <div className="space-y-4 pt-1">
      <h1 className="text-2xl font-black">Il tuo percorso 🛤️</h1>
      <p className="text-sm text-espresso-soft -mt-2">
        Units build on each other — follow them in order, but nothing is locked. You're the boss.
      </p>
      {UNITS.map((u, i) => {
        const parts = [(lessonScores[u.id] ?? 0) > 0, !!dialoguesDone[u.id], !!readingsDone[u.id]]
        const done = parts.filter(Boolean).length
        const recommended = UNITS.findIndex((x) => !(lessonScores[x.id] > 0)) === i
        return (
          <Link
            key={u.id}
            to={`/unit/${u.id}`}
            className="block bg-paper rounded-3xl p-4 shadow-sm active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{u.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold truncate">
                    {u.order}. {u.title}
                  </p>
                  {recommended && (
                    <span className="text-[10px] font-black bg-basil text-white px-2 py-0.5 rounded-full shrink-0">
                      NEXT
                    </span>
                  )}
                </div>
                <p className="text-sm text-espresso-soft">
                  {u.titleEn} · {u.cefr}
                </p>
              </div>
              <span className="text-sm font-black text-basil">{done}/3</span>
            </div>
            <ProgressBar value={done / 3} className="mt-3 h-2" />
          </Link>
        )
      })}
      <Link
        to="/stories"
        className="block bg-gold-light rounded-3xl p-4 shadow-sm active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">🪄</span>
          <div className="flex-1">
            <p className="font-extrabold">Storie AI</p>
            <p className="text-sm text-espresso-soft">Endless graded readers on any topic you like</p>
          </div>
          <span className="text-2xl text-basil font-black">→</span>
        </div>
      </Link>
    </div>
  )
}
