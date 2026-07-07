import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { unlockSpeech } from './lib/speech'
import { Gate } from './components/Gate'
import { BottomNav } from './components/BottomNav'
import { TopBar } from './components/TopBar'
import { Dashboard } from './pages/Dashboard'
import { Learn } from './pages/Learn'
import { UnitHub } from './pages/UnitHub'
import { Lesson } from './pages/Lesson'
import { DialoguePage } from './pages/DialoguePage'
import { ReadingPage } from './pages/ReadingPage'
import { Speak } from './pages/Speak'
import { Conversa } from './pages/Conversa'
import { Stories } from './pages/Stories'
import { Lens } from './pages/Lens'
import { Review } from './pages/Review'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  // Prime the speech engine on the very first user interaction. iOS Safari
  // requires speech to be unlocked inside a user gesture before it will play.
  useEffect(() => {
    const prime = () => unlockSpeech()
    window.addEventListener('pointerdown', prime, { once: true })
    window.addEventListener('touchstart', prime, { once: true })
    return () => {
      window.removeEventListener('pointerdown', prime)
      window.removeEventListener('touchstart', prime)
    }
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Gate>
      <div className="min-h-dvh flex flex-col">
        <TopBar />
        <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-28">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/unit/:id" element={<UnitHub />} />
            <Route path="/unit/:id/lesson" element={<Lesson />} />
            <Route path="/unit/:id/listen" element={<DialoguePage />} />
            <Route path="/unit/:id/read" element={<ReadingPage />} />
            <Route path="/speak" element={<Speak />} />
            <Route path="/conversa" element={<Conversa />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/lens" element={<Lens />} />
            <Route path="/review" element={<Review />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
      </Gate>
    </BrowserRouter>
  )
}
