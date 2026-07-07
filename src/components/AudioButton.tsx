import { useState } from 'react'
import { speakItalian, unlockSpeech } from '../lib/speech'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'

export function AudioButton({
  text,
  slow = false,
  size = 'md',
  className,
}: {
  text: string
  slow?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const rate = useStore((s) => s.settings.speechRate)
  const [playing, setPlaying] = useState(false)

  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-11 h-11 text-lg', lg: 'w-16 h-16 text-2xl' }

  return (
    <button
      type="button"
      aria-label={slow ? 'Play slowly' : 'Play audio'}
      onClick={(e) => {
        e.stopPropagation()
        unlockSpeech()
        setPlaying(true)
        void speakItalian(text, { rate: slow ? rate * 0.62 : rate }).finally(() => setPlaying(false))
      }}
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 shadow-sm',
        playing ? 'bg-gold text-espresso scale-105' : 'bg-basil text-white',
        sizes[size],
        className,
      )}
    >
      {slow ? '🐢' : playing ? '🔊' : '🔉'}
    </button>
  )
}
