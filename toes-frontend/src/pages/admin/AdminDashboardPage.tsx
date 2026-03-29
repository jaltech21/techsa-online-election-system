import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../hooks/useAdminAuth'
import AdminShell from '../../components/admin/AdminShell'
import cable from '../../lib/cable'

interface Stats {
  total_voters: number
  active_elections: number
  keys_sold: number
  vote_velocity: number
  pending_questions: number
  total_candidates: number
}

interface Election {
  id: number; title: string; status: string
  votes_cast: number; total_voters: number
  starts_at: string | null; ends_at: string | null
}

const TILES = [
  { key: 'total_voters',      label: 'Total Voters',    icon: '👥', color: '#6366f1', bg: 'rgba(99,102,241,0.07)',  border: 'rgba(99,102,241,0.18)' },
  { key: 'active_elections',  label: 'Live Elections',  icon: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.18)'  },
  { key: 'keys_sold',         label: 'Keys Sold',       icon: '🔑', color: '#f59e0b', bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.18)' },
  { key: 'vote_velocity',     label: 'Votes / 10 min',  icon: '⚡', color: '#10b981', bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.18)' },
  { key: 'pending_questions', label: 'Pending Q&A',     icon: '❓', color: '#f97316', bg: 'rgba(249,115,22,0.07)',  border: 'rgba(249,115,22,0.18)' },
  { key: 'total_candidates',  label: 'Candidates',      icon: '🎖️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.07)',  border: 'rgba(139,92,246,0.18)' },
]

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string; pulse?: boolean }> = {
    open:   { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', label: 'LIVE',   pulse: true },
    draft:  { bg: 'rgba(100,116,139,0.1)', color: '#475569', label: 'DRAFT'  },
    closed: { bg: 'rgba(55,65,81,0.1)',    color: '#374151', label: 'CLOSED' },
  }
  const c = cfg[status] ?? cfg.draft
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: c.bg, color: c.color, fontSize: '0.6875rem', fontWeight: 700,
      padding: '0.25rem 0.625rem', borderRadius: '99px', letterSpacing: '0.06em',
    }}>
      {c.pulse && <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'kpulse 1.4s infinite' }} />}
      {c.label}
    </span>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [elections, setElections] = useState<Election[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const loadStats = useCallback(() => {
    adminApi.get('/dashboard').then(r => { setStats(r.data); setLastUpdated(new Date()) })
  }, [])

  const loadElections = useCallback(() => {
    adminApi.get('/elections').then(r => setElections(r.data))
  }, [])

  useEffect(() => {
    loadStats()
    loadElections()
    const interval = setInterval(() => { loadStats(); loadElections() }, 30_000)
    return () => clearInterval(interval)
  }, [loadStats, loadElections])

  // Subscribe to live election updates via ActionCable
  useEffect(() => {
    const openIds = elections.filter(e => e.status === 'open').map(e => e.id)
    if (!openIds.length) return
    const subs = openIds.map(id =>
      cable.subscriptions.create(
        { channel: 'AnalyticsChannel', election_id: id },
        { received: () => { loadStats(); loadElections() } }
      )
    )
    return () => subs.forEach(s => s.unsubscribe())
  }, [elections.length, loadStats, loadElections])

  const liveElections = elections.filter(e => e.status === 'open')
  const otherElections = elections.filter(e => e.status !== 'open')

  const now = new Date()
  const timeStr = lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <AdminShell title="Dashboard" subtitle="Real-time overview of the TECHSA 2026 Election">
      <style>{`
        @keyframes kpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.85)} }
      `}</style>

      {/* Last updated */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          ↻ Last refreshed {timeStr} · auto-refreshes every 30s
        </span>
      </div>

      {/* ── Metric tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10.5rem, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {TILES.map(t => (
          <div key={t.key} style={{
            background: t.bg, border: `1px solid ${t.border}`,
            borderRadius: '1rem', padding: '1.25rem',
          }}>
            <div style={{ fontSize: '1.625rem', marginBottom: '0.5rem' }}>{t.icon}</div>
            <div style={{ fontSize: '2.125rem', fontWeight: 800, color: t.color, lineHeight: 1 }}>
              {stats ? (stats as unknown as Record<string, number>)[t.key] ?? '—' : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.375rem', fontWeight: 500 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* ── Live Now ── */}
      {liveElections.length > 0 && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: '#ef4444', animation: 'kpulse 1.4s infinite' }} />
            LIVE NOW
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {liveElections.map(e => {
              const pct = e.total_voters > 0 ? Math.min(100, Math.round((e.votes_cast / e.total_voters) * 100)) : 0
              return (
                <div key={e.id} style={{
                  background: 'white', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444',
                  borderRadius: '0.875rem', padding: '1.125rem 1.25rem',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.07)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>{e.title}</span>
                    <Link to={`/admin/elections/${e.id}/analytics`} style={{ fontSize: '0.8125rem', color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                      View Live →
                    </Link>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '99px', transition: 'width 0.6s' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {e.votes_cast} / {e.total_voters} votes ({pct}%)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── All Elections ── */}
      {elections.length > 0 && (
        <section>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            ALL ELECTIONS
          </h2>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', overflow: 'hidden' }}>
            {elections.map((e, i) => (
              <div key={e.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.875rem 1.25rem',
                borderBottom: i < elections.length - 1 ? '1px solid #f8fafc' : 'none',
              }}>
                <StatusPill status={e.status} />
                <span style={{ flex: 1, fontWeight: 500, color: '#374151', fontSize: '0.9rem' }}>{e.title}</span>
                {e.status !== 'draft' && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{e.votes_cast} votes</span>
                )}
                <Link to="/admin/elections" style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Manage →</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {!stats && elections.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Loading dashboard…</div>
      )}
    </AdminShell>
  )
}
