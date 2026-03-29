import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, useAdminAuth } from '../../hooks/useAdminAuth'
import AdminShell from '../../components/admin/AdminShell'

interface Election {
  id: number; title: string; status: string; created_at: string
  starts_at: string | null; ends_at: string | null
  votes_cast: number; total_voters: number
}

// ── Kebab (⋮) dropdown ───────────────────────────────────────────────────────
function KebabMenu({ items }: { items: { label: string; icon: string; onClick: () => void }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (ev: MouseEvent) => { if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '2.125rem', height: '2.125rem', borderRadius: '0.5rem',
          border: '1px solid #e2e8f0', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '1.125rem', color: '#64748b',
        }}
        title="More actions"
      >⋮</button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 0.25rem)', zIndex: 50,
          background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '11rem', overflow: 'hidden',
        }}>
          {items.map((item, i) => (
            <button key={i} onClick={() => { item.onClick(); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.875rem', background: 'none', border: 'none',
                borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem', color: '#374151',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string; pulse?: boolean }> = {
    open:   { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', label: 'LIVE',   pulse: true },
    draft:  { bg: 'rgba(100,116,139,0.1)', color: '#475569', label: 'DRAFT' },
    closed: { bg: 'rgba(55,65,81,0.1)',    color: '#374151', label: 'CLOSED' },
  }
  const c = cfg[status] ?? cfg.draft
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: c.bg, color: c.color, fontSize: '0.6875rem', fontWeight: 700,
      padding: '0.25rem 0.625rem', borderRadius: '99px', letterSpacing: '0.06em',
    }}>
      {c.pulse && <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'kpulse 1.4s ease-in-out infinite' }} />}
      {c.label}
    </span>
  )
}

// ── Mini turnout bar ──────────────────────────────────────────────────────────
function TurnoutBar({ votes, total }: { votes: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((votes / total) * 100)) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.5rem' }}>
      <div style={{ flex: 1, height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '99px', transition: 'width 0.6s' }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 500 }}>
        {votes} / {total} ({pct}%)
      </span>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem', animation: 'skeleton 1.4s ease-in-out infinite' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: '0.875rem', background: '#e2e8f0', borderRadius: '0.375rem', width: '40%', marginBottom: '0.375rem' }} />
          <div style={{ height: '0.625rem', background: '#f1f5f9', borderRadius: '0.375rem', width: '15%' }} />
        </div>
        <div style={{ height: '2rem', width: '5rem', background: '#e2e8f0', borderRadius: '0.5rem' }} />
        <div style={{ height: '2rem', width: '2rem', background: '#f1f5f9', borderRadius: '0.5rem' }} />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminElectionsPage() {
  useAdminAuth() // ensures admin context is present (RequireAdmin wraps this)
  const navigate = useNavigate()

  const [elections, setElections] = useState<Election[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', starts_at: '', ends_at: '' })
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTimes, setEditTimes] = useState({ starts_at: '', ends_at: '' })

  const load = () => adminApi.get('/elections').then((r) => setElections(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await adminApi.post('/elections', form)
    setForm({ title: '', description: '', starts_at: '', ends_at: '' })
    setShowCreate(false)
    load()
  }

  const toggle = async (id: number) => {
    setToggling(id)
    await adminApi.patch(`/elections/${id}/toggle_status`).finally(() => setToggling(null))
    load()
  }

  const saveTimes = async (id: number) => {
    await adminApi.patch(`/elections/${id}`, {
      starts_at: editTimes.starts_at || null,
      ends_at:   editTimes.ends_at   || null,
    })
    setEditingId(null)
    load()
  }

  const openCountdown = (e: Election) => {
    setEditingId(editingId === e.id ? null : e.id)
    setEditTimes({
      starts_at: e.starts_at ? e.starts_at.slice(0, 16) : '',
      ends_at:   e.ends_at   ? e.ends_at.slice(0, 16)   : '',
    })
  }

  const toggleLabel = (s: string) => s === 'draft' ? 'Open' : s === 'open' ? 'Close' : 'Reopen'
  const toggleStyle = (s: string): React.CSSProperties => ({
    padding: '0.4375rem 1.125rem', borderRadius: '0.5rem', border: 'none',
    fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    background: s === 'draft' ? 'linear-gradient(135deg, #16a34a, #15803d)'
              : s === 'open'  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
              : '#6b7280',
    color: 'white',
    boxShadow: s === 'open'  ? '0 0 12px rgba(220,38,38,0.3)'
             : s === 'draft' ? '0 0 12px rgba(22,163,74,0.25)'
             : 'none',
  })

  const liveCount = elections.filter(e => e.status === 'open').length

  return (
    <AdminShell
      title="Elections"
      subtitle={liveCount > 0 ? `🔴 ${liveCount} election(s) currently live` : `${elections.length} election(s) total`}
    >
      <style>{`
        @keyframes kpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes skeleton { 0%,100%{opacity:1} 50%{opacity:0.55} }
      `}</style>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <button onClick={() => setShowCreate(v => !v)}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
            padding: '0.5625rem 1.125rem', borderRadius: '0.625rem', border: 'none',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            boxShadow: '0 0 16px rgba(99,102,241,0.3)',
          }}>+ New Election</button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={create} style={{ background: 'white', border: '1px solid #e2e8f0', borderTop: '3px solid #6366f1', borderRadius: '0.875rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 700 }}>New Election</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.9rem', outline: 'none' }}
              placeholder="Election title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea rows={2} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {(['starts_at', 'ends_at'] as const).map((field) => (
                <label key={field} style={{ fontSize: '0.8rem' }}>
                  <span style={{ display: 'block', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
                    {field === 'starts_at' ? 'Voting Opens' : 'Voting Closes (countdown)'}
                  </span>
                  <input type="datetime-local" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem 0.625rem', fontSize: '0.875rem', outline: 'none' }} />
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreate(false)}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
              <button type="submit"
                style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Create</button>
            </div>
          </div>
        </form>
      )}

      {/* Elections list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[0, 1, 2].map(i => <Skeleton key={i} />)}
        </div>
      ) : elections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: 'white', borderRadius: '0.875rem', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗳️</div>
          <p style={{ fontWeight: 600, color: '#64748b', margin: 0 }}>No elections yet</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.375rem', color: '#94a3b8' }}>Create your first election above</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {elections.map((e) => (
            <div key={e.id}>
              <div style={{
                background: 'white', border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${e.status === 'open' ? '#ef4444' : e.status === 'draft' ? '#6366f1' : '#94a3b8'}`,
                borderRadius: '0.875rem', padding: '1rem 1.25rem',
                boxShadow: e.status === 'open' ? '0 4px 12px rgba(239,68,68,0.07)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>{e.title}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    {e.status !== 'draft' && (
                      <TurnoutBar votes={e.votes_cast ?? 0} total={e.total_voters ?? 0} />
                    )}
                  </div>

                  {/* Primary toggle */}
                  <button onClick={() => toggle(e.id)} disabled={toggling === e.id}
                    style={{ ...toggleStyle(e.status), opacity: toggling === e.id ? 0.6 : 1 }}>
                    {toggling === e.id ? '…' : toggleLabel(e.status)}
                  </button>

                  {/* Kebab menu */}
                  <KebabMenu items={[
                    { icon: '📊', label: 'Analytics', onClick: () => navigate(`/admin/elections/${e.id}/analytics`) },
                    { icon: '🔑', label: 'Reg. Keys',  onClick: () => navigate(`/admin/elections/${e.id}/keys`) },
                    { icon: '❓', label: 'Q&A',        onClick: () => navigate(`/admin/elections/${e.id}/qa`) },
                    { icon: '⏱',  label: 'Set Countdown', onClick: () => openCountdown(e) },
                  ]} />
                </div>

                {/* Inline countdown editor */}
                {editingId === e.id && (
                  <div style={{ marginTop: '1rem', background: '#f8faff', border: '1px solid #c7d2fe', borderRadius: '0.75rem', padding: '1rem' }}>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: '#4338ca' }}>⏱ Set Countdown — "{e.title}"</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {(['starts_at', 'ends_at'] as const).map((field) => (
                        <label key={field} style={{ fontSize: '0.8rem' }}>
                          <span style={{ display: 'block', fontWeight: 600, color: '#64748b', marginBottom: '0.3rem' }}>
                            {field === 'starts_at' ? 'Voting Opens' : 'Voting Closes'}
                          </span>
                          <input type="datetime-local" value={editTimes[field]}
                            onChange={(ev) => setEditTimes({ ...editTimes, [field]: ev.target.value })}
                            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #c7d2fe', borderRadius: '0.5rem', padding: '0.5rem 0.625rem', fontSize: '0.875rem', outline: 'none', background: 'white' }} />
                        </label>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#6366f1', margin: '0.5rem 0 0.75rem' }}>
                      💡 "Voting Closes" drives the live countdown on the election page and landing page.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingId(null)}
                        style={{ padding: '0.4375rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                      <button onClick={() => saveTimes(e.id)}
                        style={{ padding: '0.4375rem 0.875rem', border: 'none', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Save Countdown</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
