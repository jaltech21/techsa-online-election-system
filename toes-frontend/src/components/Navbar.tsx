import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Icon components
const IconBallot = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)
const IconHome = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
const IconMenu = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
    onClose?.()
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">🗳️</div>
          <div>
            <div className="font-extrabold text-white text-base leading-none">TOES</div>
            <div className="text-indigo-300 text-[10px] font-medium mt-0.5 uppercase tracking-widest">Election System</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest px-4 mb-3">Main</p>
        <Link to="/" className={isActive('/elections') || location.pathname === '/' ? 'nav-item-active' : 'nav-item'} onClick={onClose}>
          <IconHome />
          Dashboard
        </Link>
        <Link to="/elections" className={isActive('/elections') && location.pathname === '/elections' ? 'nav-item-active' : 'nav-item'} onClick={onClose}>
          <IconBallot />
          Elections
        </Link>
      </nav>

      {/* User section */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-300 to-violet-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                <p className="text-indigo-300 text-[11px] truncate">{(user as any).student_id ?? 'Student'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="nav-item w-full text-rose-300 hover:text-rose-200 hover:bg-rose-500/10">
              <IconLogout />
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item" onClick={onClose}><IconUser />Login</Link>
            <Link to="/register" className="mx-4 mt-2 block bg-amber-400 text-indigo-900 text-center py-2 rounded-xl text-sm font-bold hover:bg-amber-300 transition" onClick={onClose}>
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function Navbar() {
  return null // Sidebar-only layout; Navbar kept for compatibility
}

export function PageLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-indigo-800 shrink-0 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-indigo-800 z-50 lg:hidden flex flex-col">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
          <button
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <IconMenu />
          </button>
          <div className="flex-1" />
          <TopBarUser />
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>

        <footer className="text-center text-xs text-slate-400 py-5 border-t border-slate-200">
          © {new Date().getFullYear()} TECHSA Online Election System
        </footer>
      </div>
    </div>
  )
}

function TopBarUser() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return (
    <div className="flex items-center gap-2">
      <Link to="/login" className="text-sm text-slate-600 hover:text-indigo-600 font-medium">Login</Link>
      <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Register</Link>
    </div>
  )
  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
        <p className="text-xs text-slate-400">{(user as any).student_id ?? 'Student'}</p>
      </div>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
        {user.name[0].toUpperCase()}
      </div>
      <button
        onClick={() => { logout(); navigate('/login') }}
        className="text-xs text-slate-500 hover:text-rose-600 font-medium transition"
      >
        Sign out
      </button>
    </div>
  )
}
