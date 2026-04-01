import React, { useEffect, useState } from 'react'
import { adminApi } from '../../hooks/useAdminAuth'
import AdminShell from '../../components/admin/AdminShell'

interface VoterKey {
  id: number
  token: string
  used: boolean
  user_id?: number
  membership_ref?: string
  created_at: string
}

export default function AdminVoterKeysPage() {
  const [keys, setKeys] = useState<VoterKey[]>([])
  const [count, setCount] = useState(10)
  const [membershipRefs, setMembershipRefs] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    adminApi.get('/voter_keys').then(r => setKeys(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const generate = async () => {
    setGenerating(true)
    const refs = membershipRefs
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
    const body: any = { count }
    if (refs.length) body.membership_refs = refs
    await adminApi.post('/voter_keys/generate', body).finally(() => setGenerating(false))
    setMembershipRefs('')
    load()
  }

  const copy = (token: string, keyId: number) => {
    navigator.clipboard.writeText(token)
    setCopied(keyId)
    setTimeout(() => setCopied(null), 2000)
  }

  const filtered = keys.filter(k =>
    !search ||
    k.token.toLowerCase().includes(search.toLowerCase()) ||
    (k.membership_ref ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const unused = keys.filter(k => !k.used)
  const used = keys.filter(k => k.used)

  return (
    <AdminShell
      title="Voter Keys"
      subtitle={`${unused.length} unused · ${used.length} used · ${keys.length} total`}
    >
      {/* Mint bar */}
      <div style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem',
        padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap',
        gap: '1rem', alignItems: 'flex-end',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.375rem' }}>
            Keys to Mint
          </label>
          <input
            type="number" min={1} max={200} value={count}
            onChange={e => setCount(Number(e.target.value))}
            style={{ width: '5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5625rem 0.75rem', fontSize: '0.9375rem', textAlign: 'center', outline: 'none' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '14rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.375rem' }}>
            Membership Refs (optional, one per line)
          </label>
          <textarea
            rows={2}
            value={membershipRefs}
            onChange={e => setMembershipRefs(e.target.value)}
            placeholder={"MEM-001\nMEM-002"}
            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', resize: 'none', outline: 'none', fontFamily: 'monospace' }}
          />
        </div>

        <button
          onClick={generate}
          disabled={generating}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
            padding: '0.625rem 1.375rem', border: 'none', borderRadius: '0.625rem',
            fontWeight: 700, fontSize: '0.9375rem', cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1, boxShadow: '0 0 12px rgba(99,102,241,0.3)', whiteSpace: 'nowrap',
          }}
        >
          {generating ? 'Minting…' : `🔑 Mint ${count} Key${count !== 1 ? 's' : ''}`}
        </button>

        <div style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{unused.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Unused</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{used.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Used</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Search by token or membership ref…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', border: '1px solid #e2e8f0', borderRadius: '0.625rem',
            padding: '0.625rem 1rem', fontSize: '0.875rem', outline: 'none',
            background: 'white', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Keys table */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 5rem',
          fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8',
          padding: '0.625rem 1.25rem', background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0', letterSpacing: '0.06em',
        }}>
          <span>TOKEN</span>
          <span>MEMBERSHIP REF</span>
          <span style={{ textAlign: 'center' }}>STATUS</span>
          <span />
        </div>

        {loading ? (
          <p style={{ padding: '1.5rem', color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center' }}>Loading keys…</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔑</div>
            <p style={{ margin: 0 }}>{keys.length === 0 ? 'No keys yet. Mint some above.' : 'No matching keys.'}</p>
          </div>
        ) : (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {filtered.map((k, i) => (
              <div key={k.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 5rem',
                alignItems: 'center', padding: '0.625rem 1.25rem',
                borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                background: k.used ? '#fafafa' : 'white',
              }}>
                <code style={{ fontSize: '0.8125rem', color: k.used ? '#94a3b8' : '#374151', fontFamily: 'monospace' }}>
                  {k.token}
                </code>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  {k.membership_ref ?? <span style={{ color: '#cbd5e1' }}>—</span>}
                </span>
                <span style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '99px',
                    background: k.used ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: k.used ? '#dc2626' : '#059669',
                  }}>
                    {k.used ? 'USED' : 'UNUSED'}
                  </span>
                </span>
                <div style={{ textAlign: 'right' }}>
                  {!k.used && (
                    <button
                      onClick={() => copy(k.token, k.id)}
                      style={{
                        fontSize: '0.75rem', padding: '0.25rem 0.625rem',
                        border: '1px solid #e2e8f0', borderRadius: '0.375rem',
                        background: copied === k.id ? '#f0fdf4' : 'white',
                        color: copied === k.id ? '#059669' : '#374151',
                        cursor: 'pointer',
                      }}
                    >
                      {copied === k.id ? '✓ Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
