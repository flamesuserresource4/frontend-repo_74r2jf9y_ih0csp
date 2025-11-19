import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import PublicPortal from './components/PublicPortal'
import AdminPortal from './components/AdminPortal'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="sticky top-0 z-10 backdrop-blur border-b border-slate-800/60 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">My Portfolio</Link>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <Link to="/">Public</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<PublicPortal />} />
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </div>
  )
}

export default App
