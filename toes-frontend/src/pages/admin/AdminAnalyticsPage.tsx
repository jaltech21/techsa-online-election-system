import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { adminApi } from '../../hooks/useAdminAuth'
import AdminShell from '../../components/admin/AdminShell'
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

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6']

export default function AdminAnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Analytics | null>(null)

  const load = useCallback(() => {
    adminApi.get(`/elections/${id}/analytics`).then((r) => setData(r.data))
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!id) return
    const sub = cable.subscriptions.create(
      { channel: 'AnalyticsChannel', election_id: Number(id) },
      { received: () => load() }
    )
    return () => { sub.unsubscribe() }
  }, [id, load])

  if (!data) return (
    <AdminShell title="Analytics" subtitle={`Election #${id}`}>
      <p style={{ color: '#94a3b8', textAlign: 'center', padding: '4rem' }}>Loading live data…</p>
    </AdminShell>
  )

  const maxVotes = Math.max(...data.candidates.map((c) => c.votes), 1)
  const sorted = [...data.candidates].sort((a, b) => b.votes - a.votes)

  const statCards = [
    { label: 'Total Voters', value: data.total_voters, icon: '👥', color: '#6366f1' },
    { label: 'Votes Cast',   value: data.votes_cast,   icon: '🗳️', color: '#10b981' },
    { label: 'Turnout',      value: `${data.turnout_percent}%`, icon: '📊', color: '#f59e0b' },
  ]

  return (
    <AdminShell title="Live Analytics" subtitle={`Election #${id} — updates in real-time`}>
      <style>{`@keyframes kpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'kpulse 1.4s infinite' }} />
        <span style={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 600 }}>LIVE — auto-refreshes on every vote</span>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{icon}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.375rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Turnout progress */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.625rem' }}>
          <span>Overall Turnout</span>
          <span style={{ color: '#6366f1' }}>{data.turnout_percent}%</span>
        </div>
        <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ width: `${data.turnout_percent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '99px', transition: 'width 0.6s' }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.375rem' }}>{data.votes_cast} of {data.total_voters} registered voters</div>
      </div>

      {/* Candidate standings */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>Candidate Standings</h2>
        {sorted.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No candidates registered yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sorted.map((c, idx) => (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                  <span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{idx + 1}. {c.name}</span>
                    <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>— {c.position}</span>
                  </span>
                  <span style={{ fontWeight: 700, color: COLORS[idx % COLORS.length] }}>{c.votes} votes</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${(c.votes / maxVotes) * 100}%`, height: '100%', background: COLORS[idx % COLORS.length], borderRadius: '99px', transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
