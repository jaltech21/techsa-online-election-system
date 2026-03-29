import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

export default function AdminLoginPage() {
  const { adminLogin } = useAdminAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(form.username, form.password)
      navigate('/admin/elections')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-900 flex items-center justify-center px-4"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient glow orbs */}
      <div style={{ position: 'absolute', top: '-6rem', right: '-6rem', width: '28rem', height: '28rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-8rem', left: '-6rem', width: '32rem', height: '32rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '55%', left: '15%', width: '14rem', height: '14rem', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '26rem', position: 'relative', zIndex: 10 }}>
        {/* Brand header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '0.75rem' }}>
          <div style={{
            width: '5rem', height: '5rem', borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.25rem',
            boxShadow: '0 0 40px rgba(99,102,241,0.45), 0 0 80px rgba(99,102,241,0.15)',
          }}>
            🗳️
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0 }}>
              TECHSA Election Portal
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', marginTop: '0.375rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>
              Administrator Access
            </p>
          </div>
        </div>

        {/* Glassmorphic card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          {/* Thin top accent line */}
          <div style={{ height: '3px', borderRadius: '9999px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)', marginBottom: '1.75rem' }} />

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ color: '#fca5a5', fontSize: '0.875rem' }}>⚠ {error}</span>
              </div>
            )}

            {/* Email / Username */}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                Email / Username
              </label>
              <input
                type="text"
                autoComplete="username"
                placeholder="admin@techsa.edu"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.75)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '0.75rem',
                  padding: '0.8125rem 1rem',
                  color: 'white', fontSize: '0.9375rem',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.75)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '0.75rem',
                    padding: '0.8125rem 3rem 0.8125rem 1rem',
                    color: 'white', fontSize: '0.9375rem',
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.05rem', padding: 0, lineHeight: 1 }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.6)' } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.4)' }}
              style={{
                width: '100%', marginTop: '0.25rem',
                background: loading
                  ? 'rgba(99,102,241,0.45)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a855f7 100%)',
                color: 'white', fontWeight: 700, fontSize: '1rem',
                padding: '0.9375rem',
                borderRadius: '0.75rem', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.15s, box-shadow 0.2s, background 0.2s',
                boxShadow: loading ? 'none' : '0 0 20px rgba(99,102,241,0.4)',
                letterSpacing: '0.02em',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem' }}>
                  <span style={{
                    display: 'inline-block', width: '1rem', height: '1rem',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.75s linear infinite',
                  }} />
                  Signing in…
                </span>
              ) : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ color: '#334155', fontSize: '0.75rem', textAlign: 'center', marginTop: '1.5rem', letterSpacing: '0.02em' }}>
          TECHSA · University of Management &amp; Technology · 2026
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #3f4f65 !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(20, 22, 40, 0.98) inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white;
        }
      `}</style>
    </div>
  )
}
