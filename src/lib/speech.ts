let voicesCache: SpeechSynthesisVoice[] = []

function refreshVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const v = window.speechSynthesis.getVoices()
  if (v.length > 0) voicesCache = v
}

// Eagerly warm the voice list. iOS/Safari populate voices asynchronously and
// sometimes only after a `voiceschanged` event fires, so we listen and poll.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices()
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
  setTimeout(refreshVoices, 300)
  setTimeout(refreshVoices, 1200)
}

const PREFERRED_IT_VOICES = ['alice', 'federica', 'luca', 'emma', 'elsa', 'isabella', 'google italiano']

/** Synchronously pick the best Italian voice from the warmed cache (may be null early on). */
function pickItalianVoiceSync(): SpeechSynthesisVoice | null {
  if (voicesCache.length === 0) refreshVoices()
  const italian = voicesCache.filter((v) => v.lang.toLowerCase().startsWith('it'))
  if (italian.length === 0) return null
  for (const name of PREFERRED_IT_VOICES) {
    const match = italian.find((v) => v.name.toLowerCase().includes(name))
    if (match) return match
  }
  return italian[0]
}

export async function pickItalianVoice(): Promise<SpeechSynthesisVoice | null> {
  return pickItalianVoiceSync()
}

let unlocked = false
/**
 * iOS Safari only lets speech play if the FIRST `speak()` happens directly inside
 * a user gesture. Call this from a tap/click handler once to prime the engine.
 */
export function unlockSpeech() {
  if (unlocked || typeof window === 'undefined' || !window.speechSynthesis) return
  unlocked = true
  refreshVoices()
  try {
    const u = new SpeechSynthesisUtterance('')
    u.volume = 0
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

export interface SpeakOptions {
  rate?: number
  onEnd?: () => void
}

export function speakItalian(text: string, opts: SpeakOptions = {}): Promise<void> {
  const synth = window?.speechSynthesis
  if (!synth) return Promise.resolve()
  // CRITICAL for iOS: no `await` before speak() — that would break the user-gesture
  // chain and Safari would silently refuse to play. Pick the voice synchronously.
  synth.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'it-IT'
  const voice = pickItalianVoiceSync()
  if (voice) utter.voice = voice
  utter.rate = opts.rate ?? 0.95
  utter.pitch = 1
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      opts.onEnd?.()
      resolve()
    }
    utter.onend = finish
    utter.onerror = finish
    synth.speak(utter)
  })
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}

// ---------- Speech recognition (webkit prefixed on Safari/Chrome) ----------

interface SRResultItem {
  transcript: string
}
interface SREvent {
  resultIndex: number
  results: Array<{ isFinal: boolean; 0: SRResultItem; length: number }>
}
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SREvent) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>
  return (
    (w.SpeechRecognition as new () => SpeechRecognitionLike) ||
    (w.webkitSpeechRecognition as new () => SpeechRecognitionLike) ||
    null
  )
}

export function sttSupported(): boolean {
  return getRecognitionCtor() !== null
}

export interface ListenSession {
  stop: () => void
  abort: () => void
}

export function listenItalian(callbacks: {
  onInterim?: (text: string) => void
  onFinal: (text: string) => void
  onError?: (error: string) => void
  onEnd?: () => void
}): ListenSession | null {
  const Ctor = getRecognitionCtor()
  if (!Ctor) return null
  const rec = new Ctor()
  rec.lang = 'it-IT'
  rec.interimResults = true
  rec.continuous = false
  rec.maxAlternatives = 1

  let finalText = ''
  rec.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      if (r.isFinal) finalText += r[0].transcript + ' '
      else interim += r[0].transcript
    }
    if (interim) callbacks.onInterim?.(interim)
  }
  rec.onerror = (e) => {
    if (e.error !== 'aborted') callbacks.onError?.(e.error)
  }
  rec.onend = () => {
    if (finalText.trim()) callbacks.onFinal(finalText.trim())
    callbacks.onEnd?.()
  }
  rec.start()
  return { stop: () => rec.stop(), abort: () => rec.abort() }
}
