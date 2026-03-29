import React from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight shrink-0">
          <span className="bg-white/20 rounded-lg px-2 py-0.5">🗳️</span>
          <span>TOES</span>
        </Link>
        <div className="flex items-center gap-3 text-sm min-w-0">
          <Link to="/elections" className="opacity-90 hover:opacity-100 hover:underline shrink-0 font-medium">Elections</Link>
          {user ? (
            <>
              <span className="opacity-60 truncate max-w-[120px] hidden sm:inline text-xs">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white/15 border border-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/25 transition shrink-0"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="opacity-90 hover:opacity-100 hover:underline shrink-0 font-medium">Login</Link>
              <Link
                to="/register"
                className="bg-amber-400 text-indigo-900 px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-300 transition shrink-0"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {children}
      </main>
      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200">
        © {new Date().getFullYear()} TECHSA Online Election System
      </footer>
    </div>
  )
}
