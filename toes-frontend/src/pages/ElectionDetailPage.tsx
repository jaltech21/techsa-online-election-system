import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { PageLayout } from '../components/Navbar'
import CandidateCard from '../components/CandidateCard'
import ChatBox from '../components/ChatBox'
import CandidateDrawer from '../components/CandidateDrawer'
import type { DrawerTab } from '../components/CandidateDrawer'
import cable from '../lib/cable'

interface Candidate {
  id: number
  name: string
  position: string
  bio?: string
  manifesto?: string
  video_url?: string
  photo_url?: string | null
  votes?: number
  answered_count?: number
}

interface Election {
  id: number
  title: string
  description?: string
  status: 'draft' | 'open' | 'closed'
  ends_at?: string | null
  results?: Candidate[]
}

interface Turnout {
  votes_cast: number
  total_voters: number
  turnout_percent: number
}

function CountdownTimer({ endsAt, className = 'font-mono font-bold text-emerald-700' }: { endsAt: string; className?: string }) {
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) { setRemaining('closing soon'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt])
  return <span className={className}>{remaining}</span>
}

function generateShareCard() {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 500
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 800, 500)
  grad.addColorStop(0, '#4f46e5')
  grad.addColorStop(1, '#7c3aed')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 800, 500)
  // Circle glow
  ctx.beginPath()
  ctx.arc(400, 165, 75, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.font = 'bold 62px system-ui,sans-serif'
  ctx.fillText('\u2713', 400, 195)
  ctx.font = 'bold 54px system-ui,sans-serif'
  ctx.fillText('I Voted!', 400, 295)
  ctx.font = '28px system-ui,sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('TECHSA Online Elections 2026', 400, 360)
  ctx.font = '20px system-ui,sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText('Your voice has been heard. \ud83d\uddf3\ufe0f', 400, 410)
  canvas.toBlob((blob) => {
    if (!blob) return
    const file = new File([blob], 'i-voted-techsa-2026.png', { type: 'image/png' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((navigator as any).canShare?.({ files: [file] })) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).share({ files: [file], title: 'I Voted – TECHSA 2026', text: 'I just voted in the TECHSA 2026 student election! \ud83d\uddf3\ufe0f' }).catch(() => {})
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'i-voted-techsa-2026.png'
      a.click()
      URL.revokeObjectURL(url)
    }
  }, 'image/png')
}

export default function ElectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [election, setElection] = useState<Election | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [error, setError] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null)
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('manifesto')
  const [turnout, setTurnout] = useState<Turnout | null>(null)
  const [receipt, setReceipt] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('All')

  const openDrawer = (candidate: Candidate, tab: DrawerTab) => {
    setDrawerCandidate(candidate)
    setDrawerTab(tab)
  }

  const positions = useMemo(() => {
    const unique = Array.from(new Set(candidates.map((c) => c.position)))
    return ['All', ...unique]
  }, [candidates])

  const filteredCandidates = useMemo(() => candidates.filter((c) => {
    const matchPos = posFilter === 'All' || c.position === posFilter
    const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase())
    return matchPos && matchSearch
  }), [candidates, posFilter, search])

  useEffect(() => {
    if (!id) return
    api.get(`/elections/${id}`).then((r) => setElection(r.data))
    api.get(`/elections/${id}/candidates`).then((r) => setCandidates(r.data))
    api.get(`/elections/${id}/turnout`).then((r) => setTurnout(r.data)).catch(() => {})
  }, [id])

  // Live turnout via AnalyticsChannel
  useEffect(() => {
    if (!id) return
    const sub = cable.subscriptions.create(
      { channel: 'AnalyticsChannel', election_id: Number(id) },
      { received: (data: { votes_cast: number }) => {
        setTurnout((prev) => prev ? { ...prev, votes_cast: data.votes_cast, turnout_percent: prev.total_voters > 0 ? parseFloat((data.votes_cast / prev.total_voters * 100).toFixed(1)) : 0 } : prev)
      }}
    )
    return () => { sub.unsubscribe() }
  }, [id])

  useEffect(() => {
    if (user?.has_voted) setVoted(true)
  }, [user])

  const submitVote = async () => {
    if (!selected || !id) return
    setSubmitting(true)
    setError('')
    try {
      const voteResp = await api.post(`/elections/${id}/votes`, { candidate_id: selected })
      setReceipt(voteResp.data.reference ?? null)
      setVoted(true)
      // Reload to show updated state
      const electionResp = await api.get(`/elections/${id}`)
      setElection(electionResp.data)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to submit vote.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!election) return (
    <PageLayout>
      <div className="animate-pulse space-y-4">
        <div className="h-7 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded-full w-16 mt-2" />
        <div className="space-y-3 mt-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border rounded-xl p-4 h-20 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )

  const isOpen = election.status === 'open'
  const isClosed = election.status === 'closed'

  const statusBadge = (
    <span className={isOpen ? 'badge-open' : isClosed ? 'badge-closed' : 'badge-draft'}>
      {election.status.toUpperCase()}
    </span>
  )

  return (
    <PageLayout>
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-5 transition group"
      >
        <svg className="w-4 h-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Elections
      </button>

      {/* Election header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-7 mb-8 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">{election.title}</h1>
            {election.description && <p className="text-indigo-200 mt-1.5 text-sm">{election.description}</p>}
            <div className="mt-3">{statusBadge}</div>
          </div>
          <span className="text-4xl opacity-50 hidden sm:block">🗳️</span>
        </div>
        {/* Live turnout bar */}
        {isOpen && turnout && turnout.total_voters > 0 && (
          <div className="mt-5">
            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="text-xs text-indigo-200 mb-1.5">
              <span>🔥 Live Voter Turnout</span>
              <span>{turnout.votes_cast} / {turnout.total_voters} students ({turnout.turnout_percent}%)</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(turnout.turnout_percent, 100)}%` }}
              />
            </div>
          </div>
        )}
        {/* Voting closes countdown — set by admin */}
        {isOpen && election.ends_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mt-4 bg-white/10 rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 text-indigo-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-indigo-100 text-sm">Voting closes in</span>
            <CountdownTimer endsAt={election.ends_at} className="font-mono font-bold text-white text-sm" />
          </div>
        )}
      </div>

      {/* RESULTS VIEW (when closed) */}
      {isClosed && election.results && (() => {
        const sorted = [...election.results].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
        const total = sorted.reduce((s, c) => s + (c.votes ?? 0), 0)
        return (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">📊</span>
              <h2 className="text-xl font-extrabold text-slate-800">Final Results</h2>
              <span className="ml-auto text-sm text-slate-400 font-medium">{total} total vote{total !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-3">
              {sorted.map((c, i) => (
                <CandidateCard key={c.id} candidate={c} showVoteCount voteCount={c.votes} totalVotes={total} rank={i + 1} onOpen={(tab) => openDrawer(c, tab)} />
              ))}
            </div>
          </div>
        )
      })()}

      {/* VOTING VIEW */}
      {isOpen && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🗳️</span>
            <h2 className="text-xl font-extrabold text-slate-800">Candidates</h2>
            <span className="ml-auto text-sm text-slate-400 font-medium">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</span>
          </div>

          {voted ? (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-extrabold text-emerald-700 text-lg">Vote Recorded!</p>
              {receipt && (
                <div className="mt-3 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 inline-block">
                  <p className="text-slate-400 text-[11px] font-medium mb-0.5">Transaction ID</p>
                  <p className="font-mono font-bold text-slate-800 text-sm tracking-widest">{receipt}</p>
                </div>
              )}
              {election.ends_at ? (
                <p className="text-emerald-600 text-sm mt-3">
                  Results live in: <CountdownTimer endsAt={election.ends_at} />
                </p>
              ) : (
                <p className="text-emerald-600 text-sm mt-2">Results will be published once the election closes.</p>
              )}
              <button
                onClick={generateShareCard}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition"
              >
                📸 Share "I Voted" Card
              </button>
            </div>
          ) : !user ? (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-slate-700 font-extrabold text-base">Login to cast your vote</p>
              <p className="text-slate-500 text-sm mt-1 mb-4">You must be a registered student to vote.</p>
              <button onClick={() => navigate('/login')} className="btn-primary">
                Sign In to Vote
              </button>
            </div>
          ) : (
            <>
              {/* Search + position filter */}
              <div className="space-y-3 mb-5">
                <input
                  type="text"
                  placeholder="Search candidates by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400"
                />
                {positions.length > 2 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {positions.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPosFilter(p)}
                        className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition border ${
                          posFilter === p
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Candidate grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCandidates.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    selected={selected === c.id}
                    onSelect={setSelected}
                    onOpen={(tab) => openDrawer(c, tab)}
                  />
                ))}
                {filteredCandidates.length === 0 && (
                  <p className="text-slate-400 text-sm col-span-3 text-center py-8">No candidates match your search.</p>
                )}
              </div>
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 mt-5">{error}</div>
              )}
              <button
                onClick={submitVote}
                disabled={!selected || submitting}
                className="btn-primary w-full mt-6 py-4 text-base"
              >
                {submitting ? 'Submitting…' : selected ? '🗳️ Cast My Vote' : 'Select a candidate above'}
              </button>
            </>
          )}
        </div>
      )}

      {/* CANDIDATE LIST (when draft) */}
      {election.status === 'draft' && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🗳️</span>
            <h2 className="text-xl font-extrabold text-slate-800">Candidates</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCandidates.map((c) => <CandidateCard key={c.id} candidate={c} onOpen={(tab) => openDrawer(c, tab)} />)}
          </div>
          {filteredCandidates.length === 0 && candidates.length > 0 && <p className="text-slate-400 text-center py-10">No matches.</p>}
          {candidates.length === 0 && <p className="text-slate-400 text-center py-10">No candidates registered yet.</p>}
        </div>
      )}

      {/* LIVE CHAT — floating button + popup */}
      {(isOpen || isClosed) && (
        <>
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-30 bg-indigo-600 text-white rounded-2xl pl-4 pr-5 py-3 flex items-center gap-2.5 shadow-xl hover:bg-indigo-700 active:scale-95 transition-all font-semibold text-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Live Chat
          </button>
          <ChatBox
            electionId={election.id}
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
          />
        </>
      )}

      {/* Candidate drawer — manifesto + Q&A slide-over */}
      {drawerCandidate && (
        <CandidateDrawer
          candidate={drawerCandidate}
          initialTab={drawerTab}
          onClose={() => setDrawerCandidate(null)}
        />
      )}
    </PageLayout>
  )
}
