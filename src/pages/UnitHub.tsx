import { Link, useParams } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { getUnit } from '../data/curriculum'
import { useStore } from '../store/useStore'

export function UnitHub() {
  const { id } = useParams()
  const unit = getUnit(id ?? '')
  const lessonScores = useStore((s) => s.lessonScores)
  const dialoguesDone = useStore((s) => s.dialoguesDone)
  const readingsDone = useStore((s) => s.readingsDone)

  if (!unit) return <p className="pt-8 text-center">Unit not found.</p>

  const activities = [
    {
      to: `/unit/${unit.id}/lesson`,
      emoji: '🎯',
      title: 'Lesson',
      sub: 'Hear it, see it, say it',
      done: (lessonScores[unit.id] ?? 0) > 0,
      detail: lessonScores[unit.id] ? `Best: ${lessonScores[unit.id]}%` : '~10 min',
    },
    {
      to: `/unit/${unit.id}/listen`,
      emoji: '🎧',
      title: 'Dialogue',
      sub: unit.dialogueTitle,
      done: !!dialoguesDone[unit.id],
      detail: 'Listening + quiz',
    },
    {
      to: `/unit/${unit.id}/read`,
      emoji: '📖',
      title: 'Reading',
      sub: unit.reading.title,
      done: !!readingsDone[unit.id],
      detail: 'Tap to reveal English',
    },
  ]

  return (
    <div className="space-y-4 pt-1">
      <div className="bg-paper rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{unit.emoji}</span>
          <div>
            <h1 className="text-xl font-black leading-tight">{unit.title}</h1>
            <p className="text-sm text-espresso-soft">
              {unit.titleEn} · {unit.cefr}
            </p>
          </div>
        </div>
        <p className="text-sm mt-3 leading-relaxed">{unit.intro}</p>
      </div>

      {activities.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          className="flex items-center gap-3 bg-paper rounded-3xl p-4 shadow-sm active:scale-[0.99] transition-transform"
        >
          <span className="text-3xl">{a.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold">{a.title}</p>
            <p className="text-sm text-espresso-soft truncate">{a.sub}</p>
          </div>
          <div className="text-right shrink-0">
            {a.done && <p className="text-basil font-black">✓</p>}
            <p className="text-xs font-bold text-espresso-soft">{a.detail}</p>
          </div>
        </Link>
      ))}

      <details className="bg-paper rounded-3xl p-4 shadow-sm">
        <summary className="font-extrabold cursor-pointer">Vocabulary ({unit.vocab.length}) 🔤</summary>
        <ul className="mt-3 space-y-2">
          {unit.vocab.map((v) => (
            <li key={v.id} className="flex items-center gap-3">
              <span className="text-2xl w-9 text-center">{v.emoji}</span>
              <div className="flex-1">
                <p className="font-bold">{v.it}</p>
                <p className="text-xs text-espresso-soft">{v.en}</p>
              </div>
              <AudioButton text={v.it} size="sm" />
            </li>
          ))}
        </ul>
      </details>

      <details className="bg-paper rounded-3xl p-4 shadow-sm">
        <summary className="font-extrabold cursor-pointer">Key phrases ({unit.phrases.length}) 💬</summary>
        <ul className="mt-3 space-y-3">
          {unit.phrases.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-bold">{p.it}</p>
                <p className="text-xs text-espresso-soft">{p.en}</p>
              </div>
              <AudioButton text={p.it} size="sm" />
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
