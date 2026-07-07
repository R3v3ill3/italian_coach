import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Confetti } from '../components/Confetti'
import { generateStory, resolveAi } from '../lib/ai'
import { cn } from '../lib/utils'
import { useStore, type SavedStory } from '../store/useStore'

const TOPIC_PRESETS = [
  'Un viaggio a Roma',
  'Al mercato',
  'Una giornata al mare',
  'Il primo giorno in Italia',
  'Il cibo australiano',
  'Un cane al bar',
]

export function Stories() {
  const settings = useStore((s) => s.settings)
  const ai = resolveAi(settings)
  const srs = useStore((s) => s.srs)
  const stories = useStore((s) => s.stories)
  const addStory = useStore((s) => s.addStory)

  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  if (!ai.apiKey) {
    return (
      <div className="pt-10 text-center space-y-4">
        <p className="text-6xl">🪄</p>
        <h1 className="text-2xl font-black">Storie</h1>
        <p className="text-sm text-espresso-soft px-6 leading-relaxed">
          Unlimited tiny stories written just for your level, on any topic you like — built from the words you've
          already learned, with audio and a quiz.
        </p>
        <div className="bg-gold-light rounded-3xl p-4 mx-4 text-sm">
          This needs a Claude API key. Add one in{' '}
          <Link to="/settings" className="underline font-bold">
            Settings ⚙️
          </Link>{' '}
          and come straight back.
        </div>
      </div>
    )
  }

  const openStory = stories.find((s) => s.id === openId)
  if (openStory) return <StoryView story={openStory} onBack={() => setOpenId(null)} />

  async function generate(t: string) {
    const chosen = t.trim()
    if (!chosen || generating) return
    setGenerating(true)
    setError('')
    try {
      const knownWords = Object.keys(srs)
        .map((id) => id.split('-').slice(1).join('-'))
        .filter(Boolean)
      const story = await generateStory(ai, { topic: chosen, knownWords })
      const saved = addStory(chosen, story)
      setTopic('')
      setOpenId(saved.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Story generation failed — try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4 pt-1">
      <h1 className="text-2xl font-black">Storie 🪄</h1>
      <p className="text-sm text-espresso-soft -mt-2">
        A brand-new graded reader whenever you want one — written at your level, using words you've been learning.
      </p>

      <div className="bg-paper rounded-3xl p-4 shadow-sm space-y-3">
        <p className="font-extrabold">What should it be about?</p>
        <div className="flex flex-wrap gap-2">
          {TOPIC_PRESETS.map((t) => (
            <button
              key={t}
              disabled={generating}
              onClick={() => generate(t)}
              className="bg-cream rounded-2xl px-3 py-2 text-sm font-bold active:scale-95 transition-transform"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate(topic)}
            placeholder="…or your own topic (English is fine)"
            className="flex-1 bg-cream rounded-2xl px-3 py-2.5 font-semibold outline-none focus:ring-2 ring-basil min-w-0"
          />
          <button
            onClick={() => generate(topic)}
            disabled={!topic.trim() || generating}
            className="bg-basil text-white rounded-2xl px-4 font-bold disabled:opacity-40"
          >
            ✨
          </button>
        </div>
        {generating && <p className="text-sm font-bold text-espresso-soft animate-pulse">Writing your story… 🖋️</p>}
        {error && <p className="text-sm text-tomato font-semibold">{error}</p>}
      </div>

      {stories.length > 0 && (
        <div className="space-y-2">
          <p className="font-extrabold">Your library 📚</p>
          {stories.map((s) => (
            <button
              key={s.id}
              onClick={() => setOpenId(s.id)}
              className="w-full flex items-center gap-3 bg-paper rounded-3xl p-4 shadow-sm text-left active:scale-[0.99] transition-transform"
            >
              <span className="text-2xl">{s.read ? '✅' : '📖'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold truncate">{s.title}</p>
                <p className="text-xs text-espresso-soft truncate">{s.topic}</p>
              </div>
              <span className="text-xl text-basil font-black">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function StoryView({ story, onBack }: { story: SavedStory; onBack: () => void }) {
  const completeStory = useStore((s) => s.completeStory)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [justDone, setJustDone] = useState(false)

  const allAnswered = story.quiz.length === 0 || story.quiz.every((_, i) => answers[i] !== undefined)

  return (
    <div className="space-y-4 pt-1">
      {justDone && <Confetti count={40} />}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="font-black text-lg">
          ←
        </button>
        <h1 className="text-xl font-black flex-1">📖 {story.title}</h1>
      </div>

      <div className="bg-paper rounded-3xl p-5 shadow-sm space-y-4">
        {story.sentences.map((s, i) => {
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
                <p className={cn('text-sm text-espresso-soft transition-all', isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden')}>
                  {s.en}
                </p>
                {!isOpen && <p className="text-[10px] text-espresso-soft/60 font-bold">tap to reveal</p>}
              </button>
            </div>
          )
        })}
      </div>

      {story.quiz.length > 0 && (
        <div className="bg-paper rounded-3xl p-4 shadow-sm space-y-4">
          <p className="font-extrabold">Quick check 🧐</p>
          {story.quiz.map((q, qi) => (
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
                      onClick={() => answers[qi] === undefined && setAnswers({ ...answers, [qi]: oi })}
                      className={cn(
                        'w-full text-left rounded-xl px-3 py-2 text-sm font-semibold border-2 transition-all',
                        state === 'idle' && 'bg-cream border-transparent',
                        state === 'correct' && 'bg-basil-light border-basil',
                        state === 'wrong' && 'bg-tomato-light border-tomato',
                      )}
                    >
                      {opt}
                      {state === 'wrong' && (
                        <span className="block text-xs font-normal">Correct: {q.options[q.answer]}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!story.read && allAnswered && (
        <button
          onClick={() => {
            completeStory(story.id)
            setJustDone(true)
          }}
          className="w-full bg-basil text-white rounded-2xl py-3.5 font-bold text-lg animate-pop"
        >
          Finished! (+15 XP) ✓
        </button>
      )}
      {(story.read || justDone) && (
        <p className="text-center font-black text-basil animate-pop">{justDone ? '+15 XP · ' : ''}Bella storia! 🎉</p>
      )}
    </div>
  )
}
