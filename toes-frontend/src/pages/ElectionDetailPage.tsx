import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { PageLayout } from '../components/Navbar'
import CandidateCard from '../components/CandidateCard'
import ChatBox from '../components/ChatBox'

interface Candidate {
  id: number
  name: string
  position: string
  bio?: string
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

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{election.title}</h1>
        {election.description && <p className="text-gray-500 mt-1">{election.description}</p>}
        <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
          isOpen ? 'bg-green-100 text-green-700' : isClosed ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {election.status.toUpperCase()}
        </span>
      </div>

      {/* RESULTS VIEW (when closed) */}
      {isClosed && election.results && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Results</h2>
          <div className="space-y-3">
            {[...election.results].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)).map((c) => (
              <CandidateCard key={c.id} candidate={c} showVoteCount voteCount={c.votes} />
            ))}
          </div>
        </div>
      )}

      {/* VOTING VIEW */}
      {isOpen && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Candidates</h2>

          {voted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-5 text-center font-semibold">
              ✅ You have already voted in this election.
            </div>
          ) : !user ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-5 text-center">
              <button onClick={() => navigate('/login')} className="underline font-semibold">Login</button> to cast your vote.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {candidates.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    selected={selected === c.id}
                    onSelect={setSelected}
                  />
                ))}
              </div>
              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
              <button
                onClick={submitVote}
                disabled={!selected || submitting}
                className="mt-5 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 text-lg"
              >
                {submitting ? 'Submitting…' : 'Cast Vote'}
              </button>
            </>
          )}
        </div>
      )}

      {/* CANDIDATE LIST (when draft) */}
      {election.status === 'draft' && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Candidates</h2>
          <div className="space-y-3">
            {candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)}
          </div>
          {candidates.length === 0 && <p className="text-gray-500">No candidates yet.</p>}
        </div>
      )}

      {/* LIVE CHAT */}
      {(isOpen || isClosed) && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Discussion</h2>
          <ChatBox electionId={election.id} />
        </div>
      )}
    </PageLayout>
  )
}
