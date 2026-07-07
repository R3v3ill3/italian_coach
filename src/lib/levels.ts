export interface Level {
  name: string
  cefr: string
  minXp: number
  emoji: string
}

export const LEVELS: Level[] = [
  { name: 'Novizio', cefr: 'A1.1', minXp: 0, emoji: '🌱' },
  { name: 'Principiante', cefr: 'A1.2', minXp: 200, emoji: '🍋' },
  { name: 'Esploratore', cefr: 'A1.3', minXp: 500, emoji: '🛵' },
  { name: 'Viaggiatore', cefr: 'A2.1', minXp: 1000, emoji: '🚂' },
  { name: 'Conversatore', cefr: 'A2.2', minXp: 1800, emoji: '💬' },
  { name: 'Amico d’Italia', cefr: 'B1.1', minXp: 3000, emoji: '🇮🇹' },
  { name: 'Quasi Italiano', cefr: 'B1.2', minXp: 4800, emoji: '🍝' },
]

export function levelForXp(xp: number): { level: Level; next: Level | null; progress: number } {
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) idx = i
  }
  const level = LEVELS[idx]
  const next = LEVELS[idx + 1] ?? null
  const progress = next ? (xp - level.minXp) / (next.minXp - level.minXp) : 1
  return { level, next, progress: Math.min(1, Math.max(0, progress)) }
}
