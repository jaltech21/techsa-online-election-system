import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

const NAV = [
  { label: 'Dashboard',      icon: '📊', to: '/admin/dashboard', exact: true },
  { label: 'Elections',      icon: '🗳️', to: '/admin/elections' },
  { label: 'Announcements',  icon: '📢', to: '/admin/announcements' },
]

interface AdminShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function AdminShell({ children, title, subtitle }: AdminShellProps) {
  const { admin, adminLogout } = useAdminAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const logout = () => { adminLogout(); navigate('/admin') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: '15rem', flexShrink: 0,
        background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.375rem 1.25rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', flexShrink: 0,
              boxShadow: '0 0 16px rgba(99,102,241,0.45)',
            }}>🗳️</div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', lineHeight: 1.25 }}>TOES Admin</div>
              <div style={{ color: '#818cf8', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>TECHSA · 2026</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '1rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6875rem 0.875rem',
                  borderRadius: '0.625rem',
                  background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                  color: active ? '#a5b4fc' : '#64748b',
                  fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#94a3b8' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#64748b' }}
              >
                <span style={{ fontSize: '1rem', width: '1.25rem', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User / logout */}
        <div style={{ padding: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem', padding: '0.875rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <div style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', color: 'white', fontWeight: 700, flexShrink: 0,
              }}>A</div>
              <div style={{ color: '#94a3b8', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {admin?.username}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                width: '100%',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', borderRadius: '0.5rem',
                padding: '0.4375rem 0', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ marginLeft: '15rem', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {title && (
          <header style={{
            background: 'white', borderBottom: '1px solid #e2e8f0',
            padding: '1.125rem 1.75rem',
          }}>
            <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{title}</h1>
            {subtitle && <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>{subtitle}</p>}
          </header>
        )}
        <main style={{ flex: 1, padding: '1.75rem' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
