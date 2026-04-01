import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { PageLayout } from '../components/Navbar'

type Step = 'key' | 'identity' | 'vision' | 'review'

const STEPS: { id: Step; label: string; num: number }[] = [
  { id: 'key',      label: 'Verify Key',       num: 1 },
  { id: 'identity', label: 'Identity',          num: 2 },
  { id: 'vision',   label: 'Campaign Vision',   num: 3 },
  { id: 'review',   label: 'Review & Submit',   num: 4 },
]

function StepBar({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex(s => s.id === current)
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${i < currentIdx ? 'bg-indigo-600 text-white' : i === currentIdx ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
              {i < currentIdx ? (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 3.293 9.879a1 1 0 111.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : s.num}
            </div>
            <span className={`mt-1.5 text-[11px] font-semibold hidden sm:block ${i === currentIdx ? 'text-indigo-600' : i < currentIdx ? 'text-indigo-400' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 transition-all ${i < currentIdx ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function PhotoAvatar({ photo, name }: { photo: File | null; name: string }) {
  const initials = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'C'
  if (photo) {
    return <img src={URL.createObjectURL(photo)} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
  }
  return (
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-md">
      {initials}
    </div>
  )
}

function AuthGate() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loginForm, setLoginForm] = useState({ student_id: '', password: '' })
  const [regForm, setRegForm] = useState({ student_id: '', name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const validateEmail = (v: string) => {
    if (!v) { setEmailError('Email is required.'); return false }
    if (!EMAIL_RE.test(v)) { setEmailError('Must be a valid email address.'); return false }
    setEmailError(''); return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginForm.student_id, loginForm.password)
    } catch {
      setError('Invalid student ID or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (regForm.password !== regForm.password_confirmation) {
      setError('Passwords do not match.')
      return
    }
    if (!validateEmail(regForm.email)) return
    setLoading(true)
    try {
      await register(regForm)
    } catch (err: any) {
      const msgs = err.response?.data?.errors
      setError(msgs ? msgs.join(', ') : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400'

  return (
    <PageLayout>
      <div className="max-w-md mx-auto py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Run for Office</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {mode === 'login'
              ? 'Sign in with your student account to continue with candidate registration.'
              : 'Create your student account to begin your candidate registration.'}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
        )}

        {/* Login form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Student ID</label>
              <input
                className={inputCls}
                placeholder="e.g. 22/cs/tec/094"
                value={loginForm.student_id}
                onChange={e => setLoginForm(f => ({ ...f, student_id: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
              <input
                type="password"
                className={inputCls}
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>Signing in…</> : 'Sign In & Continue →'}
            </button>
          </form>
        )}

        {/* Register form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Student ID</label>
              <input
                className={inputCls}
                placeholder="e.g. 22/cs/tec/094"
                value={regForm.student_id}
                onChange={e => setRegForm(f => ({ ...f, student_id: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
              <input
                className={inputCls}
                placeholder="e.g. Amara Koroma"
                value={regForm.name}
                onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                className={`${inputCls} ${emailError ? 'border-rose-400 bg-rose-50' : ''}`}
                placeholder="student@umt.edu"
                value={regForm.email}
                onChange={e => { setRegForm(f => ({ ...f, email: e.target.value })); if (emailError) validateEmail(e.target.value) }}
                onBlur={e => validateEmail(e.target.value)}
                required
              />
              {emailError && <p className="text-rose-600 text-xs mt-1">{emailError}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
              <input
                type="password"
                className={inputCls}
                placeholder="Min 6 characters"
                value={regForm.password}
                onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confirm Password</label>
              <input
                type="password"
                className={inputCls}
                placeholder="Repeat password"
                value={regForm.password_confirmation}
                onChange={e => setRegForm(f => ({ ...f, password_confirmation: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>Creating account…</> : 'Create Account & Continue →'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400 mt-5">
          After signing in you'll be taken directly to the candidate registration form.
        </p>
      </div>
    </PageLayout>
  )
}

export default function CandidateRegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('key')
  const [done, setDone] = useState(false)
  const [token, setToken] = useState('')
  const [keyInfo, setKeyInfo] = useState<{ election_title: string; election_id: number } | null>(null)
  const [form, setForm] = useState({ name: '', position: '', bio: '', manifesto: '', video_url: '' })
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!user) return <AuthGate />

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const verifyKey = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/candidates/verify_key?token=${encodeURIComponent(token)}`)
      setKeyInfo({ election_title: res.data.election_title, election_id: res.data.election_id })
      setStep('identity')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or already-used registration key.')
    } finally {
      setLoading(false)
    }
  }

  const submitRegistration = async () => {
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('token', token)
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (photo) fd.append('photo', photo)

      await api.post('/candidates/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDone(true)
    } catch (err: any) {
      const msgs = err.response?.data?.errors ?? [err.response?.data?.error ?? 'Registration failed.']
      setError(msgs.join(', '))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">You're on the ballot!</h1>
          <p className="text-slate-500 mb-2">Your candidacy has been successfully registered.</p>
          <p className="text-slate-400 text-sm mb-8">Voters can now view your profile and campaign vision.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/candidate/portal')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition"
            >
              Go to My Campaign Portal
            </button>
            <button onClick={() => navigate('/elections')} className="border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition">
              View Elections
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1">Candidate Registration</p>
          <h1 className="text-2xl font-bold text-slate-900">Join the election</h1>
          <p className="text-slate-500 text-sm mt-1">Complete all steps to submit your candidacy.</p>
        </div>

        <StepBar current={step} />

        {keyInfo && step !== 'key' && (
          <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
            <svg className="w-4 h-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Registering for: <span className="font-bold">{keyInfo.election_title}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-6 text-sm">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── Step 1: Verify Key ────────────────────────────────── */}
        {step === 'key' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Enter your registration key</h2>
            <p className="text-sm text-slate-500 mb-6">The key was issued by an administrator. It is single-use and tied to a specific election.</p>
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Registration Key</label>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400 tracking-widest"
                value={token}
                onChange={(e) => { setToken(e.target.value.trim()); setKeyInfo(null) }}
                placeholder="TOES-XXXXXXXX-XXXX"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter' && token && !loading) verifyKey() }}
              />
            </div>
            <button
              onClick={verifyKey}
              disabled={!token || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition"
            >
              {loading ? 'Verifying…' : 'Verify & Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 2: Identity ─────────────────────────────────── */}
        {step === 'identity' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Your identity</h2>
            <p className="text-sm text-slate-500 mb-6">This information will appear on your public candidate profile.</p>

            {/* Photo upload + live preview */}
            <div className="flex items-center gap-5 mb-7 p-4 bg-slate-50 rounded-xl">
              <PhotoAvatar photo={photo} name={form.name} />
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">{form.name || 'Your Name'}</p>
                <p className="text-xs text-slate-500 mb-3">{form.position || 'Position'}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition"
                >
                  {photo ? 'Change photo' : 'Upload photo'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name *</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Amara Koroma"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Running For (Position) *</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.position}
                  onChange={set('position')}
                  placeholder="e.g. President, Secretary General"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button onClick={() => setStep('key')} className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition">
                ← Back
              </button>
              <button
                onClick={() => setStep('vision')}
                disabled={!form.name || !form.position}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Campaign Vision ───────────────────────────── */}
        {step === 'vision' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Campaign vision</h2>
            <p className="text-sm text-slate-500 mb-6">Tell voters what makes your candidacy unique. Be clear and compelling.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Short Bio</label>
                <p className="text-[11px] text-slate-400 mb-2">2-3 sentences introducing yourself to voters.</p>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.bio}
                  onChange={set('bio')}
                  placeholder="I am a 3rd year Computer Science student passionate about tech inclusion…"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Manifesto / Campaign Promises</label>
                <p className="text-[11px] text-slate-400 mb-2">Detail your plans and commitments. Use bullet points to make it scannable.</p>
                <textarea
                  rows={7}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  value={form.manifesto}
                  onChange={set('manifesto')}
                  placeholder={"• Improve student welfare facilities\n• Create mentorship programs\n• Increase transparency in student governance\n…"}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Campaign Video (optional)</label>
                <p className="text-[11px] text-slate-400 mb-2">YouTube or Vimeo URL — will be embedded on your profile.</p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    value={form.video_url}
                    onChange={set('video_url')}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button onClick={() => setStep('identity')} className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition">
                ← Back
              </button>
              <button
                onClick={() => setStep('review')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition"
              >
                Review →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Submit ────────────────────────────── */}
        {step === 'review' && (
          <div className="space-y-5">
            {/* Preview card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Card header */}
              <div className="relative h-20 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
              <div className="px-6 pb-6">
                <div className="flex items-end gap-4 -mt-10 mb-4">
                  <div className="ring-4 ring-white rounded-full">
                    <PhotoAvatar photo={photo} name={form.name} />
                  </div>
                  <div className="pb-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{form.name || '—'}</h3>
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-0.5">{form.position || '—'}</span>
                  </div>
                </div>

                {form.bio && (
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{form.bio}</p>
                )}

                {form.manifesto && (
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Manifesto</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{form.manifesto}</p>
                  </div>
                )}

                {form.video_url && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Campaign Video</p>
                    <p className="text-xs text-indigo-600 truncate">{form.video_url}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-600 space-y-2">
              {[
                { label: 'Registration key provided', ok: !!token },
                { label: 'Name & position set', ok: !!(form.name && form.position) },
                { label: 'Campaign bio written', ok: !!form.bio },
                { label: 'Manifesto provided', ok: !!form.manifesto },
                { label: 'Campaign video added', ok: !!form.video_url, optional: true },
                { label: 'Photo uploaded', ok: !!photo, optional: true },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${row.ok ? 'bg-emerald-500' : row.optional ? 'bg-slate-300' : 'bg-amber-400'}`}>
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  <span className={row.ok ? 'text-slate-700' : row.optional ? 'text-slate-400' : 'text-amber-700'}>
                    {row.label}{row.optional ? ' (optional)' : ''}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('vision')} className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition">
                ← Back
              </button>
              <button
                onClick={submitRegistration}
                disabled={loading || !form.name || !form.position}
                className="flex-2 flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Submitting…
                  </>
                ) : 'Submit Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
