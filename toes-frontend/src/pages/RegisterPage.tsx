import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'

type KeyState = 'idle' | 'checking' | 'valid' | 'invalid'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/elections'
  const [form, setForm] = useState({
    student_id: '', name: '', email: '', password: '', password_confirmation: '',
  })
  const [voterKey, setVoterKey] = useState('')
  const [keyState, setKeyState] = useState<KeyState>('idle')
  const [keyError, setKeyError] = useState('')
  const [error, setError] = useState('')

  const verifyKey = async (token: string) => {
    if (!token.trim()) { setKeyState('idle'); setKeyError(''); return }
    setKeyState('checking')
    setKeyError('')
    try {
      await api.get(`/voter_keys/verify?token=${encodeURIComponent(token.trim())}`)
      setKeyState('valid')
    } catch (err: any) {
      setKeyState('invalid')
      setKeyError(err.response?.data?.error ?? 'Invalid voter key.')
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (keyState !== 'valid') {
      setError('Please enter a valid voter key before registering.')
      return
    }
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      return
    }
    try {
      await register({ ...form, voter_key: voterKey.trim() } as any)
      navigate(from, { replace: true })
    } catch (err: any) {
      const msgs = err.response?.data?.errors
      setError(msgs ? msgs.join(', ') : err.response?.data?.error ?? 'Registration failed.')
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 text-slate-900 placeholder:text-slate-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-white font-extrabold text-2xl">
            <span className="bg-white/20 rounded-xl px-3 py-1">🗳️</span> TOES
          </span>
          <p className="text-indigo-200 text-sm mt-2">TECHSA Online Election System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">You need a voter key issued by an administrator after verifying your membership.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Voter Key field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Voter Key <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  className={`${inputCls} font-mono tracking-widest pr-10 ${
                    keyState === 'valid' ? 'border-emerald-400 bg-emerald-50' :
                    keyState === 'invalid' ? 'border-rose-400 bg-rose-50' : ''
                  }`}
                  placeholder="VOTER-XXXXXXXX-XXXXXXXX"
                  value={voterKey}
                  onChange={e => {
                    setVoterKey(e.target.value)
                    setKeyState('idle')
                    setKeyError('')
                  }}
                  onBlur={e => verifyKey(e.target.value)}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {keyState === 'checking' && (
                    <svg className="w-4 h-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
                  )}
                  {keyState === 'valid' && (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                  {keyState === 'invalid' && (
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
              </div>
              {keyState === 'valid' && (
                <p className="text-emerald-600 text-xs mt-1 font-medium">✓ Valid voter key</p>
              )}
              {keyState === 'invalid' && (
                <p className="text-rose-600 text-xs mt-1">{keyError}</p>
              )}
              {keyState === 'idle' && (
                <p className="text-slate-400 text-xs mt-1">Provided by an administrator after membership verification.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Student ID</label>
              <input className={inputCls} placeholder="e.g. 22/cs/tec/094" value={form.student_id}
                onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
              <input className={inputCls} placeholder="e.g. Amara Koroma" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email (optional)</label>
              <input type="email" className={inputCls} placeholder="student@umt.edu" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
              <input type="password" className={inputCls} placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confirm Password</label>
              <input type="password" className={inputCls} placeholder="Repeat password" value={form.password_confirmation}
                onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} required />
            </div>

            <button
              type="submit"
              disabled={loading || keyState === 'checking'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
