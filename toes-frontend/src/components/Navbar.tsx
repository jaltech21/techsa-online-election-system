import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from './NotificationBell'

/* ── Icons ───────────────────────────────────────────────── */
const IcBallot = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)
const IcHome = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const IcUser = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IcLogout = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
const IcCampaign = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)
const IcQA = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
)
const IcProfile = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IcMenu = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
const IcChevron = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

/* ── NavLink — uses inline classes so flex always works ── */
function NavLink({ to, icon, label, exact = false, onClick }: {
  to: string; icon: ReactNode; label: string; exact?: boolean; onClick?: () => void
}) {
  const { pathname, search } = useLocation()
  const toPath = to.split('?')[0]
  const toSearch = to.includes('?') ? `?${to.split('?')[1]}` : ''
  const active = exact
    ? pathname === toPath
    : toSearch
      ? pathname === toPath && search === toSearch
      : pathname.startsWith(toPath)
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
      className={`w-full px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all relative
        ${ active
          ? 'bg-indigo-500/25 text-white font-semibold'
          : 'text-slate-400 hover:text-white hover:bg-white/8'
        }`}
    >
      {/* Active left pip */}
      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-400 rounded-full" />}
      <span className="shrink-0 opacity-80">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

/* ── Avatar initials ─────────────────────────────────────── */
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-11 h-11 text-base' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white font-bold shrink-0`}>
      {name[0].toUpperCase()}
    </div>
  )
}

/* ── Sidebar content ─────────────────────────────────────── */
function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full select-none">

      {/* Brand */}
      <div className="px-5 py-5">
        <Link to="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-lg shadow-inner shadow-indigo-400/30 shrink-0">
            🗳️
          </div>
          <div>
            <div className="text-white font-extrabold text-[15px] leading-none tracking-tight">TOES</div>
            <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Election System</div>
          </div>
        </Link>
      </div>

      <div className="mx-4 border-t border-white/8" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {user?.candidate_id ? (
          <>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.12em] px-3 pb-2 pt-1">My Campaign</p>
            <NavLink to="/candidate/portal" icon={<IcHome />} label="Campaign Home" exact onClick={onClose} />
            <NavLink to="/candidate/portal?tab=profile" icon={<IcProfile />} label="My Profile" onClick={onClose} />
            <NavLink to="/candidate/portal?tab=questions" icon={<IcQA />} label="Q&A Inbox" onClick={onClose} />
            <div className="mx-1 my-3 border-t border-white/8" />
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.12em] px-3 pb-2">As a Voter</p>
            <NavLink to="/elections" icon={<IcBallot />} label="Elections" onClick={onClose} />
          </>
        ) : (
          <>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.12em] px-3 pb-2 pt-1">Navigation</p>
            <NavLink to="/" icon={<IcHome />} label="Dashboard" exact onClick={onClose} />
            <NavLink to="/elections" icon={<IcBallot />} label="Elections" onClick={onClose} />
          </>
        )}
      </nav>

      {/* User section */}
      <div className="mx-4 border-t border-white/8 mb-3" />
      <div className="px-3 pb-5 space-y-1">
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              className="px-3 py-3 rounded-xl bg-white/8">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-semibold truncate leading-none">{user.name}</p>
                <p className="text-slate-500 text-[11px] truncate mt-0.5">{(user as any).student_id ?? 'Student'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              className="w-full px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
            >
              <span className="shrink-0"><IcLogout /></span>
              <span>Sign out</span>
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" icon={<IcUser />} label="Login" onClick={onClose} />
            <div className="px-1 pt-1">
              <Link
                to="/register"
                onClick={onClose}
                className="block w-full bg-indigo-500 hover:bg-indigo-400 text-white text-center py-2 rounded-xl text-sm font-bold transition"
              >
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Navbar() { return null }

/* ── Page Layout ─────────────────────────────────────────── */
export function PageLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  // Derive breadcrumb from path
  const crumb = pathname === '/' ? 'Dashboard'
    : pathname.startsWith('/elections/') ? 'Election Detail'
    : pathname.startsWith('/elections') ? 'Elections'
    : pathname.startsWith('/candidate/portal') ? 'My Campaign'
    : pathname.startsWith('/candidates/register') ? 'Candidate Registration'
    : pathname.startsWith('/login') ? 'Login'
    : pathname.startsWith('/register') ? 'Register'
    : 'Page'

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 shrink-0 fixed inset-y-0 left-0 z-30 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 lg:hidden flex flex-col overflow-y-auto">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">

        {/* Top header */}
        <header className="bg-white border-b border-slate-200/80 px-5 py-0 h-14 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              onClick={() => setSidebarOpen(true)}
            >
              <IcMenu />
            </button>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="text-sm">
              <span className="text-slate-400 font-medium hidden sm:block">TECHSA</span>
              <span className="text-slate-300 hidden sm:block"><IcChevron /></span>
              <span className="font-semibold text-slate-700">{crumb}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationBell />
            <TopBarUser />
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-7 max-w-6xl w-full mx-auto">
          {children}
        </main>

        <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200">
          © {new Date().getFullYear()} TECHSA Online Election System
        </footer>
      </div>
    </div>
  )
}

/* ── Top bar user widget ─────────────────────────────────── */
function TopBarUser() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Link to="/login" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition">Login</Link>
      <Link to="/register" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-semibold transition">Register</Link>
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className="text-right hidden sm:block">
        <p className="text-[13px] font-semibold text-slate-800 leading-none">{user.name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{(user as any).student_id ?? 'Student'}</p>
      </div>
      <Avatar name={user.name} size="sm" />
      <button
        onClick={() => { logout(); navigate('/login') }}
        className="text-xs text-slate-400 hover:text-rose-500 font-medium transition hidden sm:block"
      >
        Sign out
      </button>
    </div>
  )
}
