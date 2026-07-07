let voicesCache: SpeechSynthesisVoice[] = []

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const have = window.speechSynthesis.getVoices()
    if (have.length > 0) {
      voicesCache = have
      resolve(have)
      return
    }
    const handler = () => {
      voicesCache = window.speechSynthesis.getVoices()
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
      resolve(voicesCache)
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    // Safari sometimes never fires voiceschanged; poll as a backup.
    setTimeout(() => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) {
        voicesCache = v
        resolve(v)
      }
    }, 400)
  })
}

const PREFERRED_IT_VOICES = ['alice', 'federica', 'luca', 'emma', 'elsa', 'isabella', 'google italiano']

export async function pickItalianVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = voicesCache.length > 0 ? voicesCache : await loadVoices()
  const italian = voices.filter((v) => v.lang.toLowerCase().startsWith('it'))
  if (italian.length === 0) return null
  for (const name of PREFERRED_IT_VOICES) {
    const match = italian.find((v) => v.name.toLowerCase().includes(name))
    if (match) return match
  }
  return italian[0]
}

export interface SpeakOptions {
  rate?: number
  onEnd?: () => void
}

export async function speakItalian(text: string, opts: SpeakOptions = {}): Promise<void> {
  const synth = window.speechSynthesis
  synth.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'it-IT'
  const voice = await pickItalianVoice()
  if (voice) utter.voice = voice
  utter.rate = opts.rate ?? 0.95
  utter.pitch = 1
  return new Promise((resolve) => {
    utter.onend = () => {
      opts.onEnd?.()
      resolve()
    }
    utter.onerror = () => {
      opts.onEnd?.()
      resolve()
    }
    synth.speak(utter)
  })
}

export function stopSpeaking() {
  window.speechSynthesis.cancel()
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
