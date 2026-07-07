import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </BrowserRouter>
  )
}
