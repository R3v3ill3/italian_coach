import { cn } from '../lib/utils'

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number // 0..1
  className?: string
  barClassName?: string
}) {
  return (
    <div className={cn('h-3 rounded-full bg-espresso/10 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full bg-basil transition-all duration-500', barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  )
}
