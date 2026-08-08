import { BrowserRouter, Routes, Route } from "react-router-dom"
import { MotionConfig } from "motion/react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import HomePage from "@/pages/HomePage"
import EventDetailPage from "@/pages/EventDetailPage"
import SubmitPage from "@/pages/SubmitPage"
import NotFoundPage from "@/pages/NotFoundPage"

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <div className="flex min-h-svh flex-col bg-background">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </MotionConfig>
  )
}
