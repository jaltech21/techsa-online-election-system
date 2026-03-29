import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { PageLayout } from '../components/Navbar'
import CandidateCard from '../components/CandidateCard'
import ChatBox from '../components/ChatBox'
import CandidateDrawer from '../components/CandidateDrawer'
import type { DrawerTab } from '../components/CandidateDrawer'

interface Candidate {
  id: number
  name: string
  position: string
  bio?: string
  manifesto?: string
  photo_url?: string | null
  votes?: number
}

interface Election {
  id: number
  title: string
  description?: string
  status: 'draft' | 'open' | 'closed'
  results?: Candidate[]
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

  const openDrawer = (candidate: Candidate, tab: DrawerTab) => {
    setDrawerCandidate(candidate)
    setDrawerTab(tab)
  }

  useEffect(() => {
    if (!id) return
    api.get(`/elections/${id}`).then((r) => setElection(r.data))
    api.get(`/elections/${id}/candidates`).then((r) => setCandidates(r.data))
  }, [id])

  useEffect(() => {
    if (user?.has_voted) setVoted(true)
  }, [user])

  const submitVote = async () => {
    if (!selected || !id) return
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/elections/${id}/votes`, { candidate_id: selected })
      setVoted(true)
      // Reload to show updated state
      const r = await api.get(`/elections/${id}`)
      setElection(r.data)
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
              <p className="text-emerald-600 text-sm mt-1">Results will be published once the election closes.</p>
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
              {/* Candidate grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {candidates.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    selected={selected === c.id}
                    onSelect={setSelected}
                    onOpen={(tab) => openDrawer(c, tab)}
                  />
                ))}
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
            {candidates.map((c) => <CandidateCard key={c.id} candidate={c} onOpen={(tab) => openDrawer(c, tab)} />)}
          </div>
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
