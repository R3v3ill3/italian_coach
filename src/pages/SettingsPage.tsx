import { useState } from 'react'
import { speakItalian } from '../lib/speech'
import { resolveAi } from '../lib/ai'
import { useStore } from '../store/useStore'

export function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const resetProgress = useStore((s) => s.resetProgress)
  const [confirmReset, setConfirmReset] = useState(false)

  const envKeyPresent = Boolean((import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined)?.trim())
  const activeKey = Boolean(resolveAi(settings).apiKey)
  const keySource = settings.apiKey ? 'this device' : envKeyPresent ? 'the site (env var)' : null

  return (
    <div className="space-y-4 pt-1">
      <h1 className="text-2xl font-black">Impostazioni ⚙️</h1>

      <section className="bg-paper rounded-3xl p-4 shadow-sm space-y-3">
        <p className="font-extrabold">AI Coach 🤖</p>
        <p className="text-sm text-espresso-soft">
          Add a Claude API key (from{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="underline font-bold">
            console.anthropic.com
          </a>
          ) to unlock personalised pronunciation coaching and smart Lens translations. Stored only on this device.
        </p>
        <div
          className={`rounded-2xl px-3 py-2 text-sm font-bold ${
            activeKey ? 'bg-basil/10 text-basil' : 'bg-tomato-light text-tomato'
          }`}
        >
          {activeKey ? `✅ AI is active — key from ${keySource}.` : '⚠️ No API key detected — AI features are off.'}
          {!settings.apiKey && (
            <span className="block font-semibold text-espresso-soft mt-1">
              {envKeyPresent
                ? 'A site-wide key is baked into this build.'
                : 'No site key found in this build. Paste one below, or set VITE_ANTHROPIC_API_KEY in Vercel and redeploy.'}
            </span>
          )}
        </div>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => updateSettings({ apiKey: e.target.value.trim() })}
          placeholder="sk-ant-…"
          autoCapitalize="none"
          autoCorrect="off"
          className="w-full bg-cream rounded-2xl px-3 py-3 font-mono text-sm outline-none focus:ring-2 ring-basil"
        />
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
          onClick={() => speakItalian('Ciao! Benvenuto in Italia. Il caffè è pronto.')}
          className="w-full bg-basil text-white rounded-2xl py-2.5 font-bold"
        >
          🔊 Test the Italian voice
        </button>
        <p className="text-xs text-espresso-soft">
          Uses your device's built-in Italian voice. On iPhone you can install higher-quality voices under Settings →
          Accessibility → Spoken Content → Voices → Italian.
        </p>
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
