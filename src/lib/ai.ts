export interface AiSettings {
  /** Shared passcode sent to the proxy; never the Anthropic key itself. */
  passcode: string
  model: string
}

/** Resolve the effective AI settings from the store. The Claude key lives server-side. */
export function resolveAi(settings: { passcode?: string; model: string }): AiSettings {
  return { passcode: settings.passcode ?? '', model: settings.model }
}

/** Local-dev only: allow a direct Anthropic call when running `pnpm dev` with a key set. */
const DEV_KEY =
  import.meta.env.DEV ? ((import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined) ?? '') : ''

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface AiHealth {
  ok: boolean
  requiresPasscode: boolean
  configured: boolean
}

/** Ask the proxy whether AI is configured and whether this passcode is accepted. */
export async function checkAiHealth(passcode: string): Promise<AiHealth> {
  if (DEV_KEY) return { ok: true, requiresPasscode: false, configured: true }
  try {
    const res = await fetch('/api/claude', {
      method: 'GET',
      headers: { 'x-app-passcode': passcode || '' },
    })
    const data = (await res.json().catch(() => ({}))) as Partial<AiHealth>
    return {
      ok: Boolean(data.ok),
      requiresPasscode: Boolean(data.requiresPasscode),
      configured: Boolean(data.configured),
    }
  } catch {
    return { ok: false, requiresPasscode: false, configured: false }
  }
}

function extractText(data: { content: Array<{ type: string; text?: string }> }): string {
  return data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('')
    .trim()
}

async function callClaude(
  settings: AiSettings,
  system: string,
  messages: ChatTurn[],
  maxTokens = 700,
): Promise<string> {
  const payload = { model: settings.model || 'claude-sonnet-5', max_tokens: maxTokens, system, messages }

  // Local dev: talk to Anthropic directly (localhost only — key not shipped in prod).
  if (DEV_KEY) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': DEV_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Claude API error ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`)
    return extractText((await res.json()) as { content: Array<{ type: string; text?: string }> })
  }

  // Production: go through our serverless proxy, which holds the key.
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-app-passcode': settings.passcode || '' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    if (res.status === 401) throw new Error('Not authorised — check the app passcode.')
    throw new Error(`AI error ${res.status}: ${body.slice(0, 200)}`)
  }
  return extractText((await res.json()) as { content: Array<{ type: string; text?: string }> })
}

function parseJson<T>(raw: string): T {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON in AI response')
  return JSON.parse(raw.slice(start, end + 1)) as T
}

// ---------------------------------------------------------------------------
// Pronunciation coach
// ---------------------------------------------------------------------------

const COACH_SYSTEM = `You are "Coach Gio", a warm, expert Italian pronunciation coach. Your student is an adult Australian English speaker who is a beginner in Italian.

You are given the target Italian sentence, its English meaning, and what a speech recogniser heard the student say. Speech recognition is imperfect — treat mismatches as *probable* pronunciation issues, not certainties.

Reply in UNDER 110 words of plain text (no markdown headings), structured as short lines:
1. One specific thing they got right (be genuine, not generic).
2. The single most important fix, explained with a sound analogy from Australian English.
3. A micro-drill: one word from the sentence to repeat three times, with a simple phonetic respelling.

Be encouraging and specific. Never be condescending.`

export async function coachFeedback(
  settings: AiSettings,
  params: { target: string; english: string; heard: string; score: number },
): Promise<string> {
  const user = `Target: "${params.target}" (meaning: "${params.english}")
Speech recogniser heard: "${params.heard}"
Similarity score: ${params.score}%`
  return callClaude(settings, COACH_SYSTEM, [{ role: 'user', content: user }])
}

// ---------------------------------------------------------------------------
// Lens translation
// ---------------------------------------------------------------------------

export interface TranslationResult {
  translation: string
  phrases: Array<{ it: string; en: string; tip?: string }>
  source: 'claude' | 'mymemory'
}

const TRANSLATE_SYSTEM = `You translate Italian text (often noisy OCR from signs, menus or labels) into English for an Australian adult learning Italian.

Fix obvious OCR errors silently. Respond with STRICT JSON only, no code fences:
{"translation": "<natural English translation of the whole text>", "phrases": [{"it": "<useful short Italian phrase from the text, cleaned up>", "en": "<English>", "tip": "<one-line pronunciation or usage tip>"}]}

Include 1-4 phrases that are genuinely useful for a beginner to learn and say aloud.`

export async function translateItalian(
  text: string,
  settings: AiSettings,
  useAi: boolean,
): Promise<TranslationResult> {
  if (useAi) {
    const raw = await callClaude(settings, TRANSLATE_SYSTEM, [{ role: 'user', content: text }], 900)
    try {
      const parsed = parseJson<{ translation: string; phrases?: Array<{ it: string; en: string; tip?: string }> }>(raw)
      return { translation: parsed.translation, phrases: parsed.phrases ?? [], source: 'claude' }
    } catch {
      return { translation: raw, phrases: [], source: 'claude' }
    }
  }

  // Free fallback: MyMemory public API (no key, rate-limited).
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 450))}&langpair=it|en`,
  )
  if (!res.ok) throw new Error('Translation service unavailable')
  const data = (await res.json()) as { responseData?: { translatedText?: string } }
  const translation = data.responseData?.translatedText
  if (!translation) throw new Error('No translation returned')
  return { translation, phrases: [], source: 'mymemory' }
}

// ---------------------------------------------------------------------------
// Conversation role-play
// ---------------------------------------------------------------------------

export interface ConversaReply {
  it: string
  en: string
  feedback: string | null
  suggestions: Array<{ it: string; en: string }>
  done: boolean
}

function conversaSystem(persona: string, goal: string): string {
  return `You are role-playing as ${persona} to help an adult Australian beginner (CEFR A1) practise spoken Italian. The learner's goal in this scenario: ${goal}.

Rules:
- Stay in character. Be warm, patient and natural.
- Reply in very simple Italian (A1 level: present tense, high-frequency words), maximum 2 short sentences.
- The learner's messages come from speech recognition and may contain transcription errors — interpret them generously.
- Gently keep the conversation moving toward the goal. When the goal is clearly achieved, wrap up naturally and set "done" to true.

Respond with STRICT JSON only, no code fences:
{"it": "<your in-character Italian reply>", "en": "<English translation of your reply>", "feedback": <null, or "<one short, kind English tip correcting a genuine error in the learner's last message>">, "suggestions": [{"it": "<something the learner could say next>", "en": "<English>"}, {"it": "...", "en": "..."}], "done": <true|false>}

Give exactly 2 suggestions, both very simple A1 Italian. Only give feedback for real errors, not for brevity or informality.`
}

export async function converse(
  settings: AiSettings,
  scenario: { persona: string; goal: string },
  history: ChatTurn[],
): Promise<ConversaReply> {
  const raw = await callClaude(settings, conversaSystem(scenario.persona, scenario.goal), history, 800)
  const parsed = parseJson<Partial<ConversaReply>>(raw)
  if (!parsed.it) throw new Error('Malformed AI reply')
  return {
    it: parsed.it,
    en: parsed.en ?? '',
    feedback: parsed.feedback ?? null,
    suggestions: parsed.suggestions ?? [],
    done: parsed.done ?? false,
  }
}

// ---------------------------------------------------------------------------
// Graded story generator
// ---------------------------------------------------------------------------

export interface AiStory {
  title: string
  sentences: Array<{ it: string; en: string }>
  quiz: Array<{ q: string; options: string[]; answer: number }>
}

const STORY_SYSTEM = `You write tiny graded readers for an adult Australian beginner learning Italian (CEFR A1).

Rules:
- 6 to 9 short sentences, present tense, high-frequency vocabulary only.
- Warm, concrete, slightly charming — never childish. The reader is 58, smart, and new to Italian.
- If a list of known words is provided, weave several of them in naturally.

Respond with STRICT JSON only, no code fences:
{"title": "<short Italian title>", "sentences": [{"it": "<Italian sentence>", "en": "<English translation>"}], "quiz": [{"q": "<English comprehension question>", "options": ["...", "...", "..."], "answer": <index of correct option>}]}

Exactly 2 quiz questions, each with 3 options.`

export async function generateStory(
  settings: AiSettings,
  params: { topic: string; knownWords: string[] },
): Promise<AiStory> {
  const user = `Topic: ${params.topic}
Known words to prefer: ${params.knownWords.slice(0, 40).join(', ') || '(none yet — keep it ultra simple)'}`
  const raw = await callClaude(settings, STORY_SYSTEM, [{ role: 'user', content: user }], 1200)
  const parsed = parseJson<Partial<AiStory>>(raw)
  if (!parsed.title || !parsed.sentences?.length) throw new Error('Malformed story')
  return { title: parsed.title, sentences: parsed.sentences, quiz: parsed.quiz ?? [] }
}
