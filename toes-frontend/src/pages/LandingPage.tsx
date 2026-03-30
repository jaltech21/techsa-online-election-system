import React from 'react'
import { Link } from 'react-router-dom'

/* ── Avatar seed data ──────────────────────────────────────────── */
const AVATARS = [
  { initials: 'AK', from: 'from-violet-500',  to: 'to-purple-700'  },
  { initials: 'SJ', from: 'from-rose-500',    to: 'to-pink-700'    },
  { initials: 'MT', from: 'from-amber-400',   to: 'to-orange-600'  },
  { initials: 'FR', from: 'from-emerald-400', to: 'to-teal-600'    },
  { initials: 'DB', from: 'from-sky-400',     to: 'to-indigo-600'  },
  { initials: 'LW', from: 'from-fuchsia-500', to: 'to-violet-700'  },
  { initials: 'OC', from: 'from-lime-400',    to: 'to-emerald-600' },
  { initials: 'NP', from: 'from-red-500',     to: 'to-rose-700'    },
  { initials: 'YB', from: 'from-cyan-400',    to: 'to-sky-600'     },
  { initials: 'ZA', from: 'from-indigo-400',  to: 'to-blue-600'    },
  { initials: 'KM', from: 'from-teal-400',    to: 'to-cyan-600'    },
  { initials: 'RF', from: 'from-orange-400',  to: 'to-amber-600'   },
]

function Avatar({ initials, from, to, size = 'md' }: {
  initials: string; from: string; to: string; size?: 'sm' | 'md' | 'lg'
}) {
  const sz =
    size === 'sm' ? 'w-9 h-9 text-xs' :
    size === 'lg' ? 'w-14 h-14 text-base' :
    'w-11 h-11 text-sm'
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${from} ${to} flex items-center justify-center text-white font-extrabold ring-2 ring-white/15 shadow-lg shrink-0 select-none`}>
      {initials}
    </div>
  )
}

function Orb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-300 group">
      <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/12 transition">
        {icon}
      </div>
      <h3 className="text-white font-bold text-[15px] mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 ring-4 ring-indigo-600/20 shadow-lg shadow-indigo-900/40">
        {n}
      </div>
      <div>
        <h4 className="text-white font-bold text-[15px] leading-snug">{title}</h4>
        <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────────────── */
const IcShield = () => (
  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)
const IcBolt = () => (
  <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)
const IcUser = () => (
  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IcChat = () => (
  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)
const IcKey = () => (
  <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
)
const IcChart = () => (
  <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const IcArrow = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

/* ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── DECORATIVE ORBS ─────────────────────────────────── */}
      <Orb className="w-[700px] h-[700px] bg-indigo-700/20 -top-60 -left-40" />
      <Orb className="w-[500px] h-[500px] bg-violet-700/15 top-20 right-0" />
      <Orb className="w-[400px] h-[400px] bg-indigo-600/10 top-[65vh] left-1/3" />

      {/* ════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <nav
          className="max-w-6xl mx-auto bg-slate-900/80 backdrop-blur-2xl border border-white/8 rounded-2xl px-5 py-3 shadow-xl"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-base shadow-lg shadow-indigo-900/50 shrink-0">
              🗳️
            </div>
            <div>
              <div className="font-extrabold text-white text-[15px] leading-none">TOES</div>
              <div className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5">Election System</div>
            </div>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/elections" className="text-slate-400 hover:text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/6 transition">
              Elections
            </Link>
            <Link to="/candidates/register" className="text-slate-400 hover:text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/6 transition">
              Run for Office
            </Link>
          </div>

          {/* Auth CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/6 transition hidden sm:block">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-indigo-900/40">
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ── */}
          <div>
            {/* Pill badge */}
            <div
              className="inline-flex bg-indigo-500/12 border border-indigo-500/25 text-indigo-300 text-[11px] font-bold uppercase tracking-[0.12em] px-4 py-1.5 rounded-full mb-7"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
              TECHSA Elections 2026 · Now Open
            </div>

            <h1 className="text-5xl sm:text-6xl font-black leading-[1.06] tracking-tight mb-6">
              Your Vote.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Your Voice.
              </span>
              <br />Your Future.
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed max-w-lg mb-10">
              TECHSA's secure, real-time digital election platform. Cast your ballot, watch live results, engage with candidates — all from one place.
            </p>

            {/* Primary CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }} className="mb-12">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-7 py-3.5 rounded-xl shadow-xl shadow-indigo-900/50 transition-all text-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Register as Voter
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white/6 hover:bg-white/12 border border-white/12 text-white font-bold px-7 py-3.5 rounded-xl transition-all text-sm backdrop-blur-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Log In
              </Link>
              <Link
                to="/candidates/register"
                className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition hidden sm:flex items-center gap-1"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Run for Office <IcArrow />
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex' }}>
                {AVATARS.slice(0, 6).map((a, i) => (
                  <div key={i} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 6 - i }}>
                    <Avatar {...a} size="sm" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white text-[13px] font-bold leading-none">500+ students registered</p>
                <p className="text-slate-500 text-[11px] mt-1">Join the TECHSA community</p>
              </div>
            </div>
          </div>

          {/* ── Right: orbiting avatar cluster ── */}
          <div className="hidden lg:flex items-center justify-center relative" style={{ height: '380px' }}>

            {/* Outer dashed orbit ring */}
            <div className="absolute w-[340px] h-[340px] rounded-full border border-dashed border-indigo-500/20"
              style={{ animation: 'spin 40s linear infinite' }} />
            {/* Inner ring */}
            <div className="absolute w-[220px] h-[220px] rounded-full border border-indigo-400/10"
              style={{ animation: 'spin 25s linear infinite reverse' }} />

            {/* Center ballot card */}
            <div className="absolute w-[120px] h-[120px] rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-2xl shadow-indigo-900/60 flex flex-col items-center justify-center gap-1.5">
              <div className="text-4xl">🗳️</div>
              <span className="text-white font-extrabold text-[10px] tracking-[0.2em] uppercase">TOES</span>
            </div>

            {/* Orbiting avatars — 8 positions */}
            {AVATARS.slice(0, 8).map((a, i) => {
              const angle = (i / 8) * 360 - 90
              const rad = (angle * Math.PI) / 180
              const r = 158
              const cx = 170, cy = 170
              const x = cx + r * Math.cos(rad)
              const y = cy + r * Math.sin(rad)
              return (
                <div key={i} className="absolute" style={{ left: x - 18, top: y - 18 }}>
                  <Avatar {...a} size="sm" />
                </div>
              )
            })}

            {/* Floating status cards */}
            <div
              className="absolute top-6 right-0 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-none">Vote cast!</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Anonymously secured</p>
              </div>
            </div>

            <div
              className="absolute bottom-10 left-0 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-none">Live results</p>
                <p className="text-emerald-400 text-[10px] mt-0.5 font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Updating now
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════════ */}
      <section className="relative border-y border-white/6 px-4 py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { icon: '🔒', value: '1:1',   label: 'One Voter, One Vote'  },
            { icon: '⚡', value: 'Live',  label: 'Real-Time Results'    },
            { icon: '🛡️', value: '100%',  label: 'Anonymized Ballots'  },
            { icon: '💬', value: '24/7',  label: 'Live Chat & Q&A'      },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="text-2xl font-black text-white mb-1">{s.value}</div>
              <div className="text-slate-500 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════ */}
      <section className="relative px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-[11px] font-extrabold uppercase tracking-[0.18em] mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">How it works</h2>
            <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">Three easy steps to participate in your student election.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Steps */}
            <div className="space-y-10">
              <Step n="1" title="Register with your Student ID"
                body="Create a secure voter account using your official TECHSA student ID. Strict identity verification ensures one account per student." />
              <Step n="2" title="Explore & engage with candidates"
                body="Browse rich candidate profiles, read manifestos, ask questions in the Q&A section, and join the live chat before election day." />
              <Step n="3" title="Cast your vote — watch it live"
                body="Vote once during the open window. Your ballot is anonymized instantly. Watch real-time results as they update live." />
            </div>

            {/* Avatar mosaic */}
            <div className="bg-white/4 border border-white/8 rounded-3xl p-7 backdrop-blur-sm">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-5 text-center">Your fellow TECHSA members</p>
              <div className="grid grid-cols-4 gap-4">
                {AVATARS.map((a, i) => (
                  <div key={i} className="flex flex-col items-center gap-2.5">
                    <Avatar {...a} size="md" />
                    <div className="w-7 h-1 rounded-full bg-white/8" />
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/6 text-center">
                <p className="text-white text-sm font-bold">500+ registered voters</p>
                <p className="text-slate-500 text-xs mt-0.5">Be part of the democratic process</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════════════ */}
      <section className="relative border-t border-white/6 px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-[11px] font-extrabold uppercase tracking-[0.18em] mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Built for modern elections</h2>
            <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              Everything you need for a transparent, engaging, and fraud-proof election — right in your browser.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={<IcShield />} title="JWT-Secured Authentication"
              body="Every student account is protected with JSON Web Tokens. Verified identities, zero unauthorized access." />
            <FeatureCard icon={<IcBolt />} title="Real-Time Everything"
              body="Results, chat, and voter counts update live via ActionCable WebSockets — no refresh ever needed." />
            <FeatureCard icon={<IcUser />} title="Rich Candidate Profiles"
              body="Photos, bios, manifestos, and interactive Q&A. Know your candidates before you vote." />
            <FeatureCard icon={<IcChat />} title="Live Election Chat"
              body="A moderated real-time discussion board per election — debate, question, and engage your candidates live." />
            <FeatureCard icon={<IcKey />} title="Pay-to-Register Keys"
              body="Candidates receive unique admin-issued keys after fee payment verification — eliminating fake candidacies." />
            <FeatureCard icon={<IcChart />} title="Admin Analytics Dashboard"
              body="Live voter turnout charts, result breakdowns by position, and full key management for administrators." />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          3 MAIN ACTION CARDS
      ════════════════════════════════════════════════════════ */}
      <section className="relative border-t border-white/6 px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-[11px] font-extrabold uppercase tracking-[0.18em] mb-3">Get Started</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Choose your path</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* — Log In — */}
            <Link
              to="/login"
              className="group block bg-white/4 border border-white/8 hover:border-white/20 hover:bg-white/8 rounded-3xl p-8 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center mb-6 text-2xl group-hover:bg-white/12 transition">
                🔑
              </div>
              <h3 className="text-white font-extrabold text-xl mb-3">Log In</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Already registered? Sign in with your student ID to view open elections and cast your vote.
              </p>
              {/* Mini avatar strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="mb-8">
                <div style={{ display: 'flex' }}>
                  {AVATARS.slice(0, 4).map((a, i) => (
                    <div key={i} style={{ marginLeft: i === 0 ? 0 : -9, zIndex: 4 - i }}>
                      <Avatar {...a} size="sm" />
                    </div>
                  ))}
                </div>
                <span className="text-slate-500 text-xs">+480 active today</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span className="text-indigo-400 text-sm font-bold" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Sign in <IcArrow />
                </span>
              </div>
            </Link>

            {/* — Register as Voter (FEATURED) — */}
            <Link
              to="/register"
              className="group block rounded-3xl p-8 transition-all duration-300 relative overflow-hidden shadow-2xl shadow-indigo-900/50"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: '1px solid rgba(167,139,250,0.2)' }}
            >
              {/* Sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/6 to-white/0 pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center mb-4 text-2xl">
                🗳️
              </div>
              <div className="inline-block bg-white/20 text-white text-[9px] font-extrabold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-4">
                Most Popular
              </div>
              <h3 className="text-white font-extrabold text-xl mb-3">Register as Voter</h3>
              <p className="text-indigo-100 text-sm leading-relaxed mb-8">
                New to TOES? Create your voter account with your student ID and start participating in elections today.
              </p>
              {/* Avatar strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="mb-8">
                <div style={{ display: 'flex' }}>
                  {AVATARS.slice(4, 9).map((a, i) => (
                    <div key={i} style={{ marginLeft: i === 0 ? 0 : -9, zIndex: 5 - i }}>
                      <Avatar {...a} size="sm" />
                    </div>
                  ))}
                </div>
                <span className="text-indigo-200 text-xs">+500 students</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span className="text-white font-bold text-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Create account <IcArrow />
                </span>
              </div>
            </Link>

            {/* — Run for Office — */}
            <Link
              to="/candidates/register"
              className="group block bg-white/4 border border-white/8 hover:border-violet-500/40 hover:bg-violet-500/5 rounded-3xl p-8 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-6 text-2xl group-hover:bg-violet-500/25 transition">
                🏛️
              </div>
              <h3 className="text-white font-extrabold text-xl mb-3">Run for Office</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Have an admin-issued registration key? Submit your candidacy, upload your manifesto, and start campaigning.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="mb-8">
                <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-amber-400 text-xs font-semibold">Requires admin-issued key</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span className="text-violet-400 text-sm font-bold" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Register candidacy <IcArrow />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/6 px-4 py-14">
        <div className="max-w-6xl mx-auto" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Brand blurb */}
          <div className="max-w-xs">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">🗳️</div>
              <span className="text-white font-extrabold text-[15px]">TOES</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              The official digital voting platform for the Technology Student Association. Secure, transparent, and real-time.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm pt-1">
            <Link to="/elections"           className="text-slate-500 hover:text-white transition font-medium">Elections</Link>
            <Link to="/login"               className="text-slate-500 hover:text-white transition font-medium">Log In</Link>
            <Link to="/register"            className="text-slate-500 hover:text-white transition font-medium">Register</Link>
            <Link to="/candidates/register" className="text-slate-500 hover:text-white transition font-medium">Run for Office</Link>
            <Link to="/admin"               className="text-slate-500 hover:text-white transition font-medium">Admin Portal</Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/6 text-slate-600 text-xs text-center">
          © {new Date().getFullYear()} TECHSA Online Election System · Maintained by the TECHSA Executive Cabinet
        </div>
      </footer>

    </div>
  )
}
