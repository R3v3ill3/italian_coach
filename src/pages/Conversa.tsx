import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Confetti } from '../components/Confetti'
import { SCENARIOS, type Scenario } from '../data/scenarios'
import { converse, resolveAi, type ChatTurn } from '../lib/ai'
import { listenItalian, speakItalian, sttSupported, type ListenSession } from '../lib/speech'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'

interface Msg {
  role: 'user' | 'coach'
  it: string
  en?: string
  feedback?: string | null
}

export function Conversa() {
  const aiReady = useStore((s) => s.aiReady)

  const [scenario, setScenario] = useState<Scenario | null>(null)

  if (!aiReady) {
    return (
      <div className="pt-10 text-center space-y-4">
        <p className="text-6xl">💬</p>
        <h1 className="text-2xl font-black">Conversa</h1>
        <p className="text-sm text-espresso-soft px-6 leading-relaxed">
          Role-play real situations — ordering coffee, buying train tickets, meeting people — with an AI partner
          that speaks simple Italian, corrects you kindly, and always suggests what you could say next.
        </p>
        <div className="bg-gold-light rounded-3xl p-4 mx-4 text-sm">
          The AI features aren’t switched on for this app yet. See{' '}
          <Link to="/settings" className="underline font-bold">
            Settings ⚙️
          </Link>{' '}
          for how they’re configured.
        </div>
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="space-y-4 pt-1">
        <h1 className="text-2xl font-black">Conversa 💬</h1>
        <p className="text-sm text-espresso-soft -mt-2">
          Pick a situation and talk your way through it. Speak or type — your partner keeps it simple, fixes your
          slips, and never lets you get stuck.
        </p>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenario(s)}
            className="w-full flex items-center gap-3 bg-paper rounded-3xl p-4 shadow-sm text-left active:scale-[0.99] transition-transform"
          >
            <span className="text-4xl">{s.emoji}</span>
            <div className="flex-1">
              <p className="font-extrabold">{s.title}</p>
              <p className="text-sm text-espresso-soft">{s.titleEn}</p>
            </div>
            <span className="text-2xl text-basil font-black">→</span>
          </button>
        ))}
      </div>
    )
  }

  return <ChatSession key={scenario.id} scenario={scenario} onExit={() => setScenario(null)} />
}

// ---------------------------------------------------------------------------

function ChatSession({ scenario, onExit }: { scenario: Scenario; onExit: () => void }) {
  const settings = useStore((s) => s.settings)
  const ai = resolveAi(settings)
  const recordConversationTurn = useStore((s) => s.recordConversationTurn)
  const finishConversation = useStore((s) => s.finishConversation)

  const [messages, setMessages] = useState<Msg[]>([
    { role: 'coach', it: scenario.starter.it, en: scenario.starter.en },
  ])
  const [suggestions, setSuggestions] = useState(scenario.starterSuggestions)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [showEnglish, setShowEnglish] = useState(true)
  const sessionRef = useRef<ListenSession | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    speakItalian(scenario.starter.it)
    return () => sessionRef.current?.abort()
  }, [scenario])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, done])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading || done) return
    setError('')
    setInput('')
    setSuggestions([])
    const nextMsgs: Msg[] = [...messages, { role: 'user', it: trimmed }]
    setMessages(nextMsgs)
    setLoading(true)
    recordConversationTurn()
    try {
      const history: ChatTurn[] = nextMsgs.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.it,
      }))
      const reply = await converse(ai, scenario, history)
      setMessages((ms) => [...ms, { role: 'coach', it: reply.it, en: reply.en, feedback: reply.feedback }])
      setSuggestions(reply.suggestions)
      speakItalian(reply.it)
      if (reply.done) {
        setDone(true)
        finishConversation()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong — try again.')
      setMessages(nextMsgs.slice(0, -1))
      setInput(trimmed)
    } finally {
      setLoading(false)
    }
  }

  function toggleMic() {
    if (listening) {
      sessionRef.current?.stop()
      return
    }
    setListening(true)
    sessionRef.current = listenItalian({
      onInterim: setInput,
      onFinal: (text) => {
        setListening(false)
        send(text)
      },
      onError: (err) => {
        setListening(false)
        if (err !== 'no-speech') setError(`Microphone: ${err}`)
      },
      onEnd: () => setListening(false),
    })
  }

  return (
    <div className="pt-1 flex flex-col" style={{ minHeight: 'calc(100dvh - 180px)' }}>
      {done && <Confetti count={40} />}
      <div className="flex items-center gap-2 pb-2">
        <button onClick={onExit} className="font-black text-lg">
          ←
        </button>
        <span className="text-2xl">{scenario.emoji}</span>
        <div className="flex-1">
          <p className="font-extrabold leading-tight">{scenario.title}</p>
          <p className="text-[11px] text-espresso-soft">{scenario.titleEn}</p>
        </div>
        <button
          onClick={() => setShowEnglish(!showEnglish)}
          className={cn('px-3 py-1.5 rounded-xl font-bold text-sm', showEnglish ? 'bg-sea text-white' : 'bg-paper shadow-sm')}
        >
          🇬🇧
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto pb-3">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm',
                m.role === 'user' ? 'bg-basil text-white rounded-br-md' : 'bg-paper rounded-bl-md',
              )}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="font-bold">{m.it}</p>
                  {m.role === 'coach' && showEnglish && m.en && (
                    <p className="text-xs text-espresso-soft mt-0.5">{m.en}</p>
                  )}
                </div>
                {m.role === 'coach' && (
                  <button onClick={() => speakItalian(m.it)} aria-label="Replay" className="text-lg shrink-0">
                    🔉
                  </button>
                )}
              </div>
              {m.feedback && (
                <p className="text-xs bg-gold-light text-espresso rounded-xl px-2.5 py-1.5 mt-2">✏️ {m.feedback}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-paper rounded-2xl rounded-bl-md px-4 py-3 shadow-sm animate-pulse font-bold text-espresso-soft">
              …
            </div>
          </div>
        )}
        {done && (
          <div className="text-center py-4 space-y-3 animate-pop">
            <p className="font-black text-basil text-lg">Conversazione completata! +10 XP 🎉</p>
            <button onClick={onExit} className="bg-espresso text-cream rounded-2xl px-6 py-2.5 font-bold">
              Another scenario →
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-sm text-tomato font-semibold text-center pb-2">{error}</p>}

      {/* Suggestions */}
      {!done && suggestions.length > 0 && !loading && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s.it)}
              className="shrink-0 bg-sea-light rounded-2xl px-3 py-2 text-left active:scale-95 transition-transform"
            >
              <p className="text-sm font-bold whitespace-nowrap">{s.it}</p>
              <p className="text-[10px] text-espresso-soft whitespace-nowrap">{s.en}</p>
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      {!done && (
        <div className="flex gap-2 items-center pb-1">
          {sttSupported() && (
            <button
              onClick={toggleMic}
              aria-label="Speak"
              className={cn(
                'w-12 h-12 rounded-full text-xl flex items-center justify-center shadow-md shrink-0 transition-all active:scale-90',
                listening ? 'bg-tomato text-white animate-pulse-ring' : 'bg-basil text-white',
              )}
            >
              {listening ? '⏹' : '🎙️'}
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder={listening ? 'Listening…' : 'Scrivi o parla in italiano…'}
            autoCapitalize="none"
            autoCorrect="off"
            className="flex-1 bg-paper rounded-2xl px-4 py-3 font-semibold shadow-sm outline-none focus:ring-2 ring-basil min-w-0"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-full bg-basil text-white text-xl font-black shadow-md shrink-0 disabled:opacity-40"
          >
            ↑
          </button>
        </div>
      )}
    </div>
  )
}
