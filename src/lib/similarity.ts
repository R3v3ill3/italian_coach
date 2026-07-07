export function normalizeItalian(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’`]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const curr = [i, ...new Array<number>(n).fill(0)]
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    prev = curr
  }
  return prev[n]
}

/** 0–100 similarity between target and spoken/typed attempt. */
export function similarityScore(target: string, attempt: string): number {
  const t = normalizeItalian(target)
  const a = normalizeItalian(attempt)
  if (!t || !a) return 0
  const dist = levenshtein(t, a)
  const score = 1 - dist / Math.max(t.length, a.length)
  return Math.max(0, Math.round(score * 100))
}

export type WordStatus = 'ok' | 'close' | 'wrong' | 'missing' | 'extra'
export interface WordDiffEntry {
  word: string
  status: WordStatus
  heard?: string
}

/** Word-level alignment of target vs attempt (edit-distance backtrack). */
export function diffWords(target: string, attempt: string): WordDiffEntry[] {
  const tw = normalizeItalian(target).split(' ').filter(Boolean)
  const aw = normalizeItalian(attempt).split(' ').filter(Boolean)
  const displayWords = target
    .replace(/[.,!?;:«»"]/g, '')
    .split(/\s+/)
    .filter(Boolean)

  const m = tw.length
  const n = aw.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = tw[i - 1] === aw[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }

  const out: WordDiffEntry[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (tw[i - 1] === aw[j - 1] ? 0 : 1)) {
      const display = displayWords[i - 1] ?? tw[i - 1]
      if (tw[i - 1] === aw[j - 1]) {
        out.unshift({ word: display, status: 'ok' })
      } else {
        const close = levenshtein(tw[i - 1], aw[j - 1]) <= Math.max(1, Math.floor(tw[i - 1].length / 3))
        out.unshift({ word: display, status: close ? 'close' : 'wrong', heard: aw[j - 1] })
      }
      i--
      j--
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      out.unshift({ word: displayWords[i - 1] ?? tw[i - 1], status: 'missing' })
      i--
    } else {
      out.unshift({ word: aw[j - 1], status: 'extra' })
      j--
    }
  }
  return out
}

/** Deterministic pronunciation tips based on tricky Italian patterns in the target. */
export function pronunciationTips(target: string): string[] {
  const t = target.toLowerCase()
  const tips: string[] = []
  if (/gli/.test(t)) tips.push('“gli” is like the “lli” in “million” — tongue flat against the roof of your mouth.')
  if (/gn/.test(t)) tips.push('“gn” is like the “ny” in “canyon” (as in “gnocchi”).')
  if (/(ce|ci)/.test(t)) tips.push('“ce/ci” has a soft “ch” sound: “ciao” = “chow”.')
  if (/(che|chi)/.test(t)) tips.push('“che/chi” is a hard “k” sound: “chiesa” = “kee-eh-za”.')
  if (/(ge|gi)/.test(t)) tips.push('“ge/gi” sounds like the “j” in “jet”: “gelato” = “jeh-LAH-toh”.')
  if (/(.)\1/.test(t.replace(/\s/g, ''))) tips.push('Hold double consonants a beat longer — “tutto” is “toot-toh”, not “toot-oh”.')
  if (/r/.test(t)) tips.push('Tap or roll the “r” with your tongue tip — never the flat Aussie “r”.')
  if (/[aeiou]$/.test(t.replace(/[^a-zà-ù]/g, ''))) tips.push('Give every final vowel its full value — Italians never swallow word endings.')
  return tips.slice(0, 3)
}
