import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminApi } from '../../hooks/useAdminAuth'
import cable from '../../lib/cable'

interface CandidateResult {
  id: number; name: string; position: string; votes: number
}

interface Analytics {
  election_id: number
  total_voters: number
  votes_cast: number
  turnout_percent: number
  candidates: CandidateResult[]
}

export default function AdminAnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Analytics | null>(null)

  const load = useCallback(() => {
    adminApi.get(`/elections/${id}/analytics`).then((r) => setData(r.data))
  }, [id])

  useEffect(() => { load() }, [load])

  // Live updates via ActionCable
  useEffect(() => {
    if (!id) return
    const sub = cable.subscriptions.create(
      { channel: 'AnalyticsChannel', election_id: Number(id) },
      { received: () => load() }
    )
    return () => { sub.unsubscribe() }
  }, [id, load])

  if (!data) return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3">
        <Link to="/admin/elections" className="font-bold">← Back</Link>
      </nav>
      <p className="p-8 text-gray-500">Loading…</p>
    </div>
  )

  const maxVotes = Math.max(...data.candidates.map((c) => c.votes), 1)
  const sorted = [...data.candidates].sort((a, b) => b.votes - a.votes)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
        <Link to="/admin/elections" className="font-bold text-lg">← TOES Admin</Link>
        <span className="text-sm opacity-70">Election #{id} — Live Analytics</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Voters', value: data.total_voters },
            { label: 'Votes Cast', value: data.votes_cast },
            { label: 'Turnout', value: `${data.turnout_percent}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-blue-700">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Results bar chart */}
        <h2 className="text-lg font-semibold mb-4">Candidate Standings</h2>
        <div className="bg-white border rounded-xl p-5 space-y-4">
          {sorted.map((c) => (
            <div key={c.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{c.name} <span className="text-gray-400 font-normal">— {c.position}</span></span>
                <span className="font-semibold text-blue-700">{c.votes} votes</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${(c.votes / maxVotes) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {sorted.length === 0 && <p className="text-gray-500 text-sm">No candidates registered yet.</p>}
        </div>
        <p className="text-xs text-gray-400 mt-3">Updates automatically in real-time as votes are cast.</p>
      </div>
    </div>
  )
}
