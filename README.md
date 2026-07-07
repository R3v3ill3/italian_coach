# Parla! 🇮🇹 — Italian Coach

A personal, evidence-based Italian learning app built for an adult English speaker starting from scratch. Mobile-first, installable to your iPhone home screen, with listening-first lessons, spaced repetition, AI pronunciation coaching, and a camera "Lens" that turns real-world Italian (signs, menus) into speaking practice.

## Features

| Area | What it does |
| --- | --- |
| **Learn** | 6 staged CEFR units (A1 → A1+): greetings, café, numbers, restaurant, around town, shopping. Each has a lesson (image+audio flashcards → listening recognition → reading → sentence building → dictation → speaking), a native-paced dialogue with slow mode and comprehension quiz, and a graded reading with tap-to-reveal English. |
| **Parla (Speak)** | Say a phrase, get a 0–100 score from on-device speech recognition, a word-by-word diff of what you nailed vs. fumbled, deterministic pronunciation tips (gli/gn/rolled r/double consonants…), and optional AI coaching from "Coach Gio" tuned for Australian English speakers. |
| **Lens** | Snap a photo of Italian text → OCR (Tesseract, runs in the browser) → translation → "practise saying it". With a Claude key you also get cleaned-up phrases worth learning, each with a tip. |
| **Conversa (AI chat)** | Voice/text role-play with a Claude-powered partner: order at a café, buy train tickets, chat with a stranger. It speaks simple A1 Italian aloud, corrects genuine errors kindly, always offers two "you could say…" chips, and wraps up (with bonus XP) when you achieve the scenario goal. |
| **Storie (AI stories)** | Unlimited graded readers written on demand — pick a topic (or invent one), and Claude writes a 6–9 sentence A1 story preferring words from your review deck, with per-sentence audio, tap-to-reveal English, and a 2-question quiz. Saved to a local library. |
| **Ripassa (Review)** | SM-2 spaced repetition over every word you've learned — English+image prompt, produce the Italian, self-grade. |
| **Gamification** | XP, CEFR-mapped levels, daily goal, streaks, weekly chart, 13 badges, confetti. Supportive, never punitive (no hearts, no lockouts). |

## The pedagogy

- **Comprehensible input / listening first** — every word is heard before you're asked to produce it.
- **Dual coding** — images paired with audio build two memory pathways.
- **Retrieval practice** — exercises force recall rather than recognition-by-rereading; wrong answers re-queue until mastered.
- **Spaced repetition** — SM-2 scheduling flattens the forgetting curve.
- **Output + corrective feedback** — speaking with immediate, specific feedback is where fluency forms.
- **Adult-learning (andragogy)** — nothing is locked, content is travel-relevant, and the "why" is always explained.

## Run it

```bash
cd italian-coach
pnpm install
pnpm dev        # http://localhost:5173
```

## Put it on your iPhone (recommended)

The mic and camera require HTTPS, so deploy it (free):

```bash
npm i -g vercel   # if needed
vercel            # from this directory; accept defaults
```

Open the URL in Safari on the phone → Share → **Add to Home Screen**. It runs full-screen like a native app.

> Tip: install a high-quality Italian voice on the iPhone under **Settings → Accessibility → Spoken Content → Voices → Italian** (e.g. Alice or Federica). The app will pick it up automatically.

## Enable the AI features

1. Get an API key at [console.anthropic.com](https://console.anthropic.com).
2. In the app: **⚙️ Settings → AI Coach** → paste the key (stored only in that device's local storage).

This unlocks:

- **Coach Gio** — personalised pronunciation feedback after each speaking attempt, tuned for Australian English speakers.
- **Conversa** — the role-play conversation partner.
- **Storie** — the on-demand graded story generator.
- **Smart Lens** — OCR-error-tolerant translations plus "worth learning" phrases with tips.

Without a key the core course, review deck and basic Lens translation still work.

**Alternative:** set `VITE_ANTHROPIC_API_KEY` in a `.env.local` file (or as a Vercel env var) and every device gets AI features without pasting the key. ⚠️ Be aware this bakes the key into the public JS bundle — anyone who finds your deployment URL could extract it. For a personal app that's a judgement call; if you use it, set a monthly spend limit on the key in the Anthropic console, or stick with the Settings-page approach (key never leaves the device).

## Notes & roadmap ideas

- Speech recognition uses the browser engine (`it-IT`); it works in Safari (iOS/macOS) and Chrome. Scores are a proxy for pronunciation — treat trends, not single numbers, as the signal.
- Google's live AR camera translation can't be embedded in web apps; the Lens replicates the useful part (read → translate → practise) and the Google Translate app remains handy for instant overlays in the street.
- Ideas for later: more units (past tense, hotel, health), conversation role-play with the AI coach, listening to real audio clips, cloud sync across devices.
