import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BADGES, type BadgeStats } from '../data/badges'
import { UNITS, type QuizQuestion } from '../data/curriculum'
import type { AiStory } from '../lib/ai'
import { newCard, scheduleCard, type ReviewGrade, type SrsCard } from '../lib/srs'
import { todayStr, addDaysStr } from '../lib/utils'

export interface Settings {
  /** Shared passcode for the AI proxy; the Claude key itself lives server-side. */
  passcode: string
  model: string
  speechRate: number
  dailyGoal: number
}

export interface SavedStory {
  id: string
  topic: string
  title: string
  sentences: Array<{ it: string; en: string }>
  quiz: QuizQuestion[]
  read: boolean
}

interface DayXp {
  day: string
  xp: number
}

interface State {
  xp: number
  streak: number
  lastActiveDay: string | null
  dayLog: DayXp[]
  lessonScores: Record<string, number> // unitId -> best first-try %
  dialoguesDone: Record<string, boolean>
  readingsDone: Record<string, boolean>
  badges: string[]
  srs: Record<string, SrsCard>
  speakAttempts: number
  bestSpeakScore: number
  reviewsDone: number
  lensScans: number
  conversationTurns: number
  storiesRead: number
  stories: SavedStory[]
  settings: Settings

  /** Runtime-only: whether the AI proxy is reachable + authorised. Not persisted. */
  aiReady: boolean
  setAiReady: (ready: boolean) => void

  addXp: (n: number) => string[]
  completeLesson: (unitId: string, score: number, vocabIds: string[]) => string[]
  completeDialogue: (unitId: string) => string[]
  completeReading: (unitId: string) => string[]
  recordSpeak: (score: number) => string[]
  recordLensScan: () => string[]
  recordConversationTurn: () => string[]
  finishConversation: () => string[]
  addStory: (topic: string, story: AiStory) => SavedStory
  completeStory: (id: string) => string[]
  reviewCard: (cardId: string, grade: ReviewGrade) => string[]
  addToSrs: (id: string, unitId: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  resetProgress: () => void
}

function unitsFullyDone(s: Pick<State, 'lessonScores' | 'dialoguesDone' | 'readingsDone'>): number {
  return UNITS.filter((u) => (s.lessonScores[u.id] ?? 0) > 0 && s.dialoguesDone[u.id] && s.readingsDone[u.id]).length
}

function statsOf(s: State): BadgeStats {
  return {
    xp: s.xp,
    streak: s.streak,
    lessonsCompleted: Object.keys(s.lessonScores).length,
    dialoguesDone: Object.keys(s.dialoguesDone).length,
    readingsDone: Object.keys(s.readingsDone).length,
    speakAttempts: s.speakAttempts,
    bestSpeakScore: s.bestSpeakScore,
    reviewsDone: s.reviewsDone,
    lensScans: s.lensScans,
    conversationTurns: s.conversationTurns,
    storiesRead: s.storiesRead,
    unitsFullyDone: unitsFullyDone(s),
  }
}

const initialProgress = {
  xp: 0,
  streak: 0,
  lastActiveDay: null as string | null,
  dayLog: [] as DayXp[],
  lessonScores: {} as Record<string, number>,
  dialoguesDone: {} as Record<string, boolean>,
  readingsDone: {} as Record<string, boolean>,
  badges: [] as string[],
  srs: {} as Record<string, SrsCard>,
  speakAttempts: 0,
  bestSpeakScore: 0,
  reviewsDone: 0,
  lensScans: 0,
  conversationTurns: 0,
  storiesRead: 0,
  stories: [] as SavedStory[],
}

export const useStore = create<State>()(
  persist(
    (set, get) => {
      /** Apply an XP gain + streak update + badge check. Returns newly earned badge ids. */
      function gainXp(n: number, extraPatch: Partial<State> = {}): string[] {
        const s = get()
        const today = todayStr()
        const yesterday = addDaysStr(today, -1)

        let streak = s.streak
        if (s.lastActiveDay !== today) {
          streak = s.lastActiveDay === yesterday ? s.streak + 1 : 1
        }

        const dayLog = [...s.dayLog]
        const entry = dayLog.find((d) => d.day === today)
        if (entry) entry.xp += n
        else dayLog.push({ day: today, xp: n })
        while (dayLog.length > 60) dayLog.shift()

        const next: State = {
          ...s,
          ...extraPatch,
          xp: s.xp + n,
          streak,
          lastActiveDay: today,
          dayLog,
        }
        const stats = statsOf(next)
        const newBadges = BADGES.filter((b) => !next.badges.includes(b.id) && b.earned(stats)).map((b) => b.id)
        set({ ...next, badges: [...next.badges, ...newBadges] })
        return newBadges
      }

      return {
        ...initialProgress,
        settings: { passcode: '', model: 'claude-sonnet-5', speechRate: 0.95, dailyGoal: 50 },
        aiReady: false,
        setAiReady: (ready) => set({ aiReady: ready }),

        addXp: (n) => gainXp(n),

        completeLesson: (unitId, score, vocabIds) => {
          const s = get()
          const srs = { ...s.srs }
          for (const id of vocabIds) {
            if (!srs[id]) srs[id] = newCard(id, unitId)
          }
          const best = Math.max(s.lessonScores[unitId] ?? 0, score)
          return gainXp(20, { srs, lessonScores: { ...s.lessonScores, [unitId]: best } })
        },

        completeDialogue: (unitId) => {
          const s = get()
          return gainXp(15, { dialoguesDone: { ...s.dialoguesDone, [unitId]: true } })
        },

        completeReading: (unitId) => {
          const s = get()
          return gainXp(15, { readingsDone: { ...s.readingsDone, [unitId]: true } })
        },

        recordSpeak: (score) => {
          const s = get()
          const xp = score >= 90 ? 15 : score >= 75 ? 10 : score >= 60 ? 5 : 2
          return gainXp(xp, {
            speakAttempts: s.speakAttempts + 1,
            bestSpeakScore: Math.max(s.bestSpeakScore, score),
          })
        },

        recordLensScan: () => {
          const s = get()
          return gainXp(5, { lensScans: s.lensScans + 1 })
        },

        recordConversationTurn: () => {
          const s = get()
          return gainXp(3, { conversationTurns: s.conversationTurns + 1 })
        },

        finishConversation: () => gainXp(10),

        addStory: (topic, story) => {
          const s = get()
          const saved: SavedStory = {
            id: `story-${Date.now()}`,
            topic,
            title: story.title,
            sentences: story.sentences,
            quiz: story.quiz,
            read: false,
          }
          set({ stories: [saved, ...s.stories].slice(0, 20) })
          return saved
        },

        completeStory: (id) => {
          const s = get()
          const story = s.stories.find((x) => x.id === id)
          if (!story || story.read) return []
          const stories = s.stories.map((x) => (x.id === id ? { ...x, read: true } : x))
          return gainXp(15, { stories, storiesRead: s.storiesRead + 1 })
        },

        reviewCard: (cardId, grade) => {
          const s = get()
          const card = s.srs[cardId]
          if (!card) return []
          const updated = scheduleCard(card, grade)
          return gainXp(2, { srs: { ...s.srs, [cardId]: updated }, reviewsDone: s.reviewsDone + 1 })
        },

        addToSrs: (id, unitId) => {
          const s = get()
          if (s.srs[id]) return
          set({ srs: { ...s.srs, [id]: newCard(id, unitId) } })
        },

        updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

        resetProgress: () => set({ ...initialProgress }),
      }
    },
    {
      name: 'parla-italian-coach',
      // aiReady is a runtime flag re-derived on each load — don't persist it.
      partialize: ({ aiReady: _aiReady, setAiReady: _setAiReady, ...rest }) => rest,
    },
  ),
)

export function todayXp(dayLog: DayXp[]): number {
  const today = todayStr()
  return dayLog.find((d) => d.day === today)?.xp ?? 0
}
