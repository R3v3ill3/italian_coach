import { Link } from 'react-router-dom'
import { BADGES } from '../data/badges'
import { UNITS } from '../data/curriculum'
import { levelForXp } from '../lib/levels'
import { isDue } from '../lib/srs'
import { todayStr } from '../lib/utils'
import { ProgressBar } from '../components/ProgressBar'
import { todayXp, useStore } from '../store/useStore'

export function Dashboard() {
  const s = useStore()
  const { level, next, progress } = levelForXp(s.xp)
  const goal = s.settings.dailyGoal
  const earnedToday = todayXp(s.dayLog)
  const dueCount = Object.values(s.srs).filter(isDue).length
  const nextUnit = UNITS.find((u) => !(s.lessonScores[u.id] > 0)) ?? UNITS[0]

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = todayStr(i - 6)
    return { day, xp: s.dayLog.find((d) => d.day === day)?.xp ?? 0 }
  })
  const maxXp = Math.max(20, ...last7.map((d) => d.xp))

  return (
    <div className="space-y-4 pt-1">
      {/* Hero */}
      <section className="bg-basil text-white rounded-3xl p-5 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black">Ciao! 👋</h1>
            <p className="text-white/85 text-sm mt-0.5">
              {earnedToday >= goal
                ? 'Daily goal smashed — grande! 🎉'
                : earnedToday > 0
                  ? `${goal - earnedToday} XP to today’s goal — keep going!`
                  : 'A few minutes a day beats an hour a week.'}
            </p>
          </div>
          <span className="text-4xl">{level.emoji}</span>
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-white/90">
            <span>
              {level.name} · {level.cefr}
            </span>
            <span>{next ? `${s.xp} / ${next.minXp} XP` : `${s.xp} XP`}</span>
          </div>
          <ProgressBar value={progress} className="bg-white/25" barClassName="bg-gold" />
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-white/90">
            <span>Today’s goal</span>
            <span>
              {earnedToday} / {goal} XP
            </span>
          </div>
          <ProgressBar value={earnedToday / goal} className="bg-white/25" barClassName="bg-tomato" />
        </div>
      </section>

      {/* Continue */}
      <Link
        to={`/unit/${nextUnit.id}`}
        className="block bg-paper rounded-3xl p-4 shadow-sm active:scale-[0.99] transition-transform"
      >
        <p className="text-xs font-black uppercase tracking-wide text-espresso-soft">Continue learning</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-4xl">{nextUnit.emoji}</span>
          <div className="flex-1">
            <p className="font-extrabold">{nextUnit.title}</p>
            <p className="text-sm text-espresso-soft">{nextUnit.titleEn}</p>
          </div>
          <span className="text-2xl text-basil font-black">→</span>
        </div>
      </Link>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/review" className="bg-sea-light rounded-3xl p-4 active:scale-[0.98] transition-transform">
          <p className="text-3xl">🔁</p>
          <p className="font-extrabold mt-1">Review</p>
          <p className="text-sm text-espresso-soft">
            {dueCount > 0 ? `${dueCount} card${dueCount === 1 ? '' : 's'} due` : 'All caught up ✨'}
          </p>
        </Link>
        <Link to="/lens" className="bg-gold-light rounded-3xl p-4 active:scale-[0.98] transition-transform">
          <p className="text-3xl">📷</p>
          <p className="font-extrabold mt-1">Lens</p>
          <p className="text-sm text-espresso-soft">Snap &amp; translate signs</p>
        </Link>
      </div>

      {/* Week chart */}
      <section className="bg-paper rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-extrabold">This week</p>
          <p className="text-sm font-black text-tomato">🔥 {s.streak}-day streak</p>
        </div>
        <div className="flex items-end gap-2 h-24 mt-3">
          {last7.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end h-16">
                <div
                  className={`w-full rounded-t-lg ${d.xp >= goal ? 'bg-basil' : d.xp > 0 ? 'bg-gold' : 'bg-espresso/10'}`}
                  style={{ height: `${Math.max(6, (d.xp / maxXp) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-espresso-soft">
                {['D', 'L', 'M', 'M', 'G', 'V', 'S'][new Date(d.day + 'T12:00').getDay()]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Badges */}
      <section className="bg-paper rounded-3xl p-4 shadow-sm">
        <p className="font-extrabold mb-3">Medaglie 🏅</p>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map((b) => {
            const earned = s.badges.includes(b.id)
            return (
              <div
                key={b.id}
                title={`${b.name} — ${b.description}`}
                className={`rounded-2xl p-2 text-center ${earned ? 'bg-gold-light' : 'bg-espresso/5 opacity-40 grayscale'}`}
              >
                <p className="text-2xl">{b.emoji}</p>
                <p className="text-[9px] font-bold leading-tight mt-1">{b.name}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Method */}
      <details className="bg-paper rounded-3xl p-4 shadow-sm">
        <summary className="font-extrabold cursor-pointer">Why this method works 🧠</summary>
        <div className="mt-3 space-y-2 text-sm text-espresso leading-relaxed">
          <p>
            <strong>Listening first.</strong> Every word is heard before you're asked to produce it — comprehension
            precedes speech, the way adults acquire language best (comprehensible input).
          </p>
          <p>
            <strong>Pictures + sound together.</strong> Pairing images with audio builds two memory pathways at once
            (dual coding), so recall is faster and sticks longer.
          </p>
          <p>
            <strong>Spaced repetition.</strong> The Review deck re-tests each word right before you'd forget it,
            flattening the forgetting curve with the fewest possible repetitions.
          </p>
          <p>
            <strong>Retrieval, not re-reading.</strong> Exercises make you pull words out of memory — the single
            most effective technique in the learning-science literature.
          </p>
          <p>
            <strong>Speaking with feedback.</strong> You produce real sentences and get immediate corrective feedback,
            which is where fluency actually forms.
          </p>
          <p>
            <strong>Small daily wins.</strong> Streaks and XP aren't just fun — consistent short sessions outperform
            occasional long ones for long-term retention.
          </p>
        </div>
      </details>
    </div>
  )
}
