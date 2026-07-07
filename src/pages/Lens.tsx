import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { resolveAi, translateItalian, type TranslationResult } from '../lib/ai'
import { ocrImage } from '../lib/ocr'
import { useStore } from '../store/useStore'

type Stage = 'idle' | 'ocr' | 'translating' | 'done' | 'error'

export function Lens() {
  const navigate = useNavigate()
  const settings = useStore((s) => s.settings)
  const aiReady = useStore((s) => s.aiReady)
  const recordLensScan = useStore((s) => s.recordLensScan)

  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [ocrText, setOcrText] = useState('')
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [error, setError] = useState('')
  const [manualText, setManualText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setStage('ocr')
    setProgress(0)
    setResult(null)
    setError('')
    setImageUrl(URL.createObjectURL(file))
    try {
      const ocr = await ocrImage(file, setProgress)
      if (!ocr.text || ocr.lines.length === 0) {
        setStage('error')
        setError("Couldn't find readable text — try a closer, straighter shot with good light.")
        return
      }
      setOcrText(ocr.lines.join('\n'))
      await runTranslate(ocr.lines.join('\n'))
    } catch (e) {
      setStage('error')
      setError(e instanceof Error ? e.message : 'Something went wrong reading the image.')
    }
  }

  async function runTranslate(text: string) {
    setStage('translating')
    try {
      const r = await translateItalian(text, resolveAi(settings), aiReady)
      setResult(r)
      setStage('done')
      recordLensScan()
    } catch (e) {
      setStage('error')
      setError(e instanceof Error ? e.message : 'Translation failed.')
    }
  }

  function practise(text: string, en?: string) {
    navigate('/speak', { state: { text, en } })
  }

  return (
    <div className="space-y-4 pt-1">
      <h1 className="text-2xl font-black">Lens 📷</h1>
      <p className="text-sm text-espresso-soft -mt-2">
        Point your camera at Italian — a sign, a menu, a label. I'll read it, translate it, and turn it into
        speaking practice.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full bg-basil text-white rounded-3xl py-6 font-black text-lg shadow-md active:scale-[0.98] transition-transform"
      >
        📸 Snap Italian text
      </button>

      {imageUrl && (
        <img src={imageUrl} alt="Captured" className="w-full max-h-56 object-contain rounded-2xl bg-espresso/5" />
      )}

      {stage === 'ocr' && (
        <div className="bg-paper rounded-2xl p-4 text-center space-y-2">
          <p className="font-bold">Reading the Italian… 🔍</p>
          <div className="h-2 bg-espresso/10 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-espresso-soft">First scan downloads the Italian OCR model (~15 MB) — one-off.</p>
        </div>
      )}
      {stage === 'translating' && (
        <div className="bg-paper rounded-2xl p-4 text-center font-bold animate-pulse">Translating… 🇮🇹→🇬🇧</div>
      )}
      {stage === 'error' && <div className="bg-tomato-light text-tomato rounded-2xl p-4 text-sm font-semibold">{error}</div>}

      {stage === 'done' && result && (
        <div className="space-y-3 animate-pop">
          <div className="bg-paper rounded-3xl p-4 shadow-sm space-y-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-espresso-soft">Italian (detected)</p>
              <div className="flex items-start gap-2 mt-1">
                <p className="font-bold whitespace-pre-wrap flex-1">{ocrText}</p>
                <AudioButton text={ocrText.replace(/\n/g, '. ')} size="sm" />
              </div>
            </div>
            <div className="border-t border-espresso/10 pt-3">
              <p className="text-xs font-black uppercase tracking-wide text-espresso-soft">English</p>
              <p className="mt-1">{result.translation}</p>
            </div>
            <button
              onClick={() => practise(ocrText.split('\n')[0], result.translation)}
              className="w-full bg-tomato text-white rounded-2xl py-3 font-bold"
            >
              🎙️ Practise saying it
            </button>
          </div>

          {result.phrases.length > 0 && (
            <div className="bg-gold-light rounded-3xl p-4 space-y-3">
              <p className="font-extrabold">Worth learning from this 📌</p>
              {result.phrases.map((p, i) => (
                <div key={i} className="bg-paper rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="font-bold">{p.it}</p>
                      <p className="text-sm text-espresso-soft">{p.en}</p>
                    </div>
                    <AudioButton text={p.it} size="sm" />
                  </div>
                  {p.tip && <p className="text-xs bg-sea-light rounded-lg px-2 py-1">💡 {p.tip}</p>}
                  <button onClick={() => practise(p.it, p.en)} className="text-sm font-bold text-tomato">
                    🎙️ Practise this →
                  </button>
                </div>
              ))}
            </div>
          )}
          {result.source === 'mymemory' && (
            <p className="text-xs text-center text-espresso-soft">
              Basic translation. Add a Claude API key in Settings for smarter translations + learnable phrases.
            </p>
          )}
        </div>
      )}

      <details className="bg-paper rounded-3xl p-4 shadow-sm">
        <summary className="font-extrabold cursor-pointer">Or type/paste Italian text ⌨️</summary>
        <div className="mt-3 space-y-2">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="e.g. Vietato l'ingresso ai non addetti"
            rows={3}
            className="w-full bg-cream rounded-2xl px-3 py-2 font-semibold outline-none focus:ring-2 ring-basil"
          />
          <button
            onClick={() => {
              if (!manualText.trim()) return
              setOcrText(manualText.trim())
              setImageUrl(null)
              runTranslate(manualText.trim())
            }}
            className="w-full bg-basil text-white rounded-2xl py-2.5 font-bold"
          >
            Translate
          </button>
        </div>
      </details>

      <div className="bg-sea-light rounded-2xl p-3 text-sm">
        🧭 <strong>Out and about?</strong> The Google Translate app's live camera mode is great for instant AR
        overlays — then bring the phrases you meet back here to actually <em>learn</em> them.
      </div>
    </div>
  )
}
