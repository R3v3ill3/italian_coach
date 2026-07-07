import type { WordDiffEntry } from '../lib/similarity'
import { cn } from '../lib/utils'

const STYLE: Record<WordDiffEntry['status'], string> = {
  ok: 'bg-basil-light text-basil-dark',
  close: 'bg-gold-light text-espresso',
  wrong: 'bg-tomato-light text-tomato',
  missing: 'bg-tomato-light text-tomato line-through opacity-80',
  extra: 'bg-espresso/10 text-espresso-soft italic',
}

export function WordDiff({ entries }: { entries: WordDiffEntry[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {entries.map((e, i) => (
        <span
          key={i}
          className={cn('px-2 py-1 rounded-lg text-sm font-bold', STYLE[e.status])}
          title={e.heard ? `heard: “${e.heard}”` : undefined}
        >
          {e.word}
          {e.status === 'close' || e.status === 'wrong' ? (
            <span className="font-normal opacity-70"> → {e.heard}</span>
          ) : null}
        </span>
      ))}
    </div>
  )
}
