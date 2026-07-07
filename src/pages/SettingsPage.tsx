import { useState } from 'react'
import { getVoiceInfo, speakItalian, type VoiceInfo } from '../lib/speech'
import { useStore } from '../store/useStore'

export function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const resetProgress = useStore((s) => s.resetProgress)
  const aiReady = useStore((s) => s.aiReady)
  const [confirmReset, setConfirmReset] = useState(false)

  const [voiceInfo, setVoiceInfo] = useState<VoiceInfo | null>(null)
  const [voiceStatus, setVoiceStatus] = useState('')

  function testVoice() {
    setVoiceInfo(getVoiceInfo())
    setVoiceStatus('▶️ sending to the speech engine…')
    let started = false
    const timer = setTimeout(() => {
      if (!started) setVoiceStatus('⚠️ No "start" event after 3s — the engine accepted it but produced no audio. Check the ring/silent switch and volume.')
    }, 3000)
    speakItalian('Ciao! Benvenuto in Italia. Il caffè è pronto.', {
      onStart: () => {
        started = true
        clearTimeout(timer)
        setVoiceStatus('🔊 Speaking now — you should hear it.')
      },
      onEnd: () => {
        clearTimeout(timer)
        setVoiceStatus((s) => (started ? '✅ Finished speaking.' : s))
      },
      onError: (err) => {
        clearTimeout(timer)
        setVoiceStatus(`⚠️ Speech engine error: ${err}`)
      },
    })
  }

  return (
    <div className="space-y-4 pt-1">
      <h1 className="text-2xl font-black">Impostazioni ⚙️</h1>

      <section className="bg-paper rounded-3xl p-4 shadow-sm space-y-3">
        <p className="font-extrabold">AI Coach 🤖</p>
        <div
          className={`rounded-2xl px-3 py-2 text-sm font-bold ${
            aiReady ? 'bg-basil/10 text-basil' : 'bg-tomato-light text-tomato'
          }`}
        >
          {aiReady ? '✅ AI features are active.' : '⚠️ AI features are off.'}
          <span className="block font-semibold text-espresso-soft mt-1">
            {aiReady
              ? 'Coach Gio, Conversa, Storie and smart Lens are all working.'
              : 'The Claude key is set server-side (ANTHROPIC_API_KEY on Vercel). If AI is off, check that env var is set and redeploy.'}
          </span>
        </div>
        <p className="text-sm text-espresso-soft">
          Your Claude key lives on the server, never in this app — so the public URL can’t leak it. Access is protected
          by the app passcode.
        </p>
        <label className="block text-sm font-bold">
          Model
          <select
            value={settings.model}
            onChange={(e) => updateSettings({ model: e.target.value })}
            className="w-full bg-cream rounded-2xl px-3 py-3 mt-1 font-semibold"
          >
            <option value="claude-sonnet-5">Claude Sonnet 5 (best coaching)</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (faster, cheaper)</option>
          </select>
        </label>
        {settings.passcode && (
          <button
            onClick={() => updateSettings({ passcode: '' })}
            className="w-full border-2 border-espresso/20 text-espresso rounded-2xl py-2.5 font-bold text-sm"
          >
            🔒 Lock this device (forget passcode)
          </button>
        )}
      </section>

      <section className="bg-paper rounded-3xl p-4 shadow-sm space-y-3">
        <p className="font-extrabold">Voice 🗣️</p>
        <label className="block text-sm font-bold">
          Speaking speed: {Math.round(settings.speechRate * 100)}%
          <input
            type="range"
            min={0.6}
            max={1.2}
            step={0.05}
            value={settings.speechRate}
            onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
            className="w-full accent-basil mt-2"
          />
        </label>
        <button
          onClick={testVoice}
          className="w-full bg-basil text-white rounded-2xl py-2.5 font-bold"
        >
          🔊 Test the Italian voice
        </button>

        {voiceStatus && (
          <div className="bg-cream rounded-2xl p-3 text-sm font-semibold">{voiceStatus}</div>
        )}

        {voiceInfo && (
          <div className="bg-cream rounded-2xl p-3 text-xs space-y-1">
            <p className="font-bold">Diagnostics</p>
            <p>Speech engine: {voiceInfo.supported ? '✅ available' : '❌ not available in this browser'}</p>
            <p>Voices loaded: {voiceInfo.total}</p>
            <p>Italian voices: {voiceInfo.italian.length > 0 ? voiceInfo.italian.join(', ') : '— none found —'}</p>
          </div>
        )}

        <div className="bg-gold-light rounded-2xl p-3 text-xs space-y-1">
          <p className="font-bold">No sound on iPhone? Check, in order:</p>
          <p>1. The <strong>ring/silent switch</strong> on the left edge — silent mode mutes web speech. Flip it so it's <em>not</em> showing orange.</p>
          <p>2. Turn the <strong>volume up</strong> with the side buttons while this app is open.</p>
          <p>3. Install a voice under <strong>Settings → Accessibility → Spoken Content → Voices → Italian</strong> (tap the cloud to download).</p>
          <p>4. Tap the test button again — it must be a direct tap to start audio.</p>
        </div>
      </section>

      <section className="bg-paper rounded-3xl p-4 shadow-sm space-y-3">
        <p className="font-extrabold">Daily goal 🎯</p>
        <div className="flex gap-2">
          {[30, 50, 80, 120].map((g) => (
            <button
              key={g}
              onClick={() => updateSettings({ dailyGoal: g })}
              className={`flex-1 rounded-2xl py-2.5 font-bold text-sm ${
                settings.dailyGoal === g ? 'bg-basil text-white' : 'bg-cream'
              }`}
            >
              {g} XP
            </button>
          ))}
        </div>
      </section>

      <section className="bg-paper rounded-3xl p-4 shadow-sm space-y-3">
        <p className="font-extrabold text-tomato">Danger zone ⚠️</p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="w-full border-2 border-tomato text-tomato rounded-2xl py-2.5 font-bold">
            Reset all progress
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-bold">Sure? This wipes XP, streaks, badges and your review deck.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetProgress()
                  setConfirmReset(false)
                }}
                className="flex-1 bg-tomato text-white rounded-2xl py-2.5 font-bold"
              >
                Yes, reset
              </button>
              <button onClick={() => setConfirmReset(false)} className="flex-1 bg-cream rounded-2xl py-2.5 font-bold">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="text-xs text-center text-espresso-soft pb-4">
        Parla! v0.1 · Made for Troy 🇦🇺→🇮🇹 · All progress lives on this device
      </p>
    </div>
  )
}
