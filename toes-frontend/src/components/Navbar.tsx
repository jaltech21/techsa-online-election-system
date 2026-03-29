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
    <nav className="bg-blue-700 text-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="text-xl font-bold tracking-tight shrink-0">
          🗳️ TOES
        </Link>
        <div className="flex items-center gap-3 text-sm min-w-0">
          <Link to="/elections" className="hover:underline shrink-0">Elections</Link>
          {user ? (
            <>
              <span className="opacity-75 truncate max-w-[100px] hidden sm:inline">Hi, {user.name}</span>
              <button onClick={handleLogout} className="bg-white text-blue-700 px-3 py-1 rounded font-semibold hover:bg-blue-50 shrink-0">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline shrink-0">Login</Link>
              <Link to="/register" className="bg-white text-blue-700 px-3 py-1 rounded font-semibold hover:bg-blue-50 shrink-0">
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  )
}
