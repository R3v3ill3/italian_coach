export interface BadgeStats {
  xp: number
  streak: number
  lessonsCompleted: number
  dialoguesDone: number
  readingsDone: number
  speakAttempts: number
  bestSpeakScore: number
  reviewsDone: number
  lensScans: number
  conversationTurns: number
  storiesRead: number
  unitsFullyDone: number
}

export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
  earned: (s: BadgeStats) => boolean
}

export const BADGES: Badge[] = [
  { id: 'primo-passo', name: 'Primo passo', emoji: '👣', description: 'Complete your first lesson', earned: (s) => s.lessonsCompleted >= 1 },
  { id: 'orecchio-fino', name: 'Orecchio fino', emoji: '👂', description: 'Complete your first dialogue', earned: (s) => s.dialoguesDone >= 1 },
  { id: 'lettore', name: 'Lettore', emoji: '📖', description: 'Finish your first reading', earned: (s) => s.readingsDone >= 1 },
  { id: 'coraggio', name: 'Coraggio!', emoji: '🎙️', description: 'Speak Italian out loud for the first time', earned: (s) => s.speakAttempts >= 1 },
  { id: 'pronuncia-doro', name: 'Pronuncia d’oro', emoji: '🏅', description: 'Score 90%+ on a spoken phrase', earned: (s) => s.bestSpeakScore >= 90 },
  { id: 'tre-giorni', name: 'Tre giorni', emoji: '🔥', description: 'A 3-day streak', earned: (s) => s.streak >= 3 },
  { id: 'una-settimana', name: 'Una settimana', emoji: '📅', description: 'A 7-day streak', earned: (s) => s.streak >= 7 },
  { id: 'un-mese', name: 'Un mese!', emoji: '🏆', description: 'A 30-day streak', earned: (s) => s.streak >= 30 },
  { id: 'occhio-magico', name: 'Occhio magico', emoji: '📷', description: 'Translate real Italian with the Lens', earned: (s) => s.lensScans >= 1 },
  { id: 'memoria', name: 'Memoria di ferro', emoji: '🧠', description: 'Complete 50 spaced-repetition reviews', earned: (s) => s.reviewsDone >= 50 },
  { id: 'cinquecento', name: 'Cinquecento', emoji: '🚗', description: 'Earn 500 XP', earned: (s) => s.xp >= 500 },
  { id: 'duemila', name: 'Duemila', emoji: '⭐', description: 'Earn 2000 XP', earned: (s) => s.xp >= 2000 },
  { id: 'giro-completo', name: 'Giro completo', emoji: '🇮🇹', description: 'Finish all six units', earned: (s) => s.unitsFullyDone >= 6 },
  { id: 'chiacchierone', name: 'Chiacchierone', emoji: '💬', description: 'Hold 25 AI conversation turns', earned: (s) => s.conversationTurns >= 25 },
  { id: 'narratore', name: 'Narratore', emoji: '📚', description: 'Read 3 AI-generated stories', earned: (s) => s.storiesRead >= 3 },
]
