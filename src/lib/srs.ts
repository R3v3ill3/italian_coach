import { addDaysStr, todayStr } from './utils'

export interface SrsCard {
  id: string
  unitId: string
  ease: number
  intervalDays: number
  reps: number
  due: string // YYYY-MM-DD
}

export function newCard(id: string, unitId: string): SrsCard {
  return { id, unitId, ease: 2.5, intervalDays: 0, reps: 0, due: todayStr() }
}

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy'

const GRADE_QUALITY: Record<ReviewGrade, number> = { again: 1, hard: 3, good: 4, easy: 5 }

/** SM-2 scheduling (Anki-style simplification). */
export function scheduleCard(card: SrsCard, grade: ReviewGrade): SrsCard {
  const q = GRADE_QUALITY[grade]
  let { ease, intervalDays, reps } = card

  if (q < 3) {
    reps = 0
    intervalDays = 1
  } else {
    reps += 1
    if (reps === 1) intervalDays = 1
    else if (reps === 2) intervalDays = 6
    else intervalDays = Math.round(intervalDays * ease)
    if (grade === 'hard') intervalDays = Math.max(1, Math.round(intervalDays * 0.8))
    if (grade === 'easy') intervalDays = Math.round(intervalDays * 1.3)
  }

  ease = Math.max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  return { ...card, ease, intervalDays, reps, due: addDaysStr(todayStr(), intervalDays) }
}

export function isDue(card: SrsCard): boolean {
  return card.due <= todayStr()
}
