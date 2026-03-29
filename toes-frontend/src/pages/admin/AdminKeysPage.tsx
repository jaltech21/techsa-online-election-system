import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { adminApi } from '../../hooks/useAdminAuth'
import AdminShell from '../../components/admin/AdminShell'

interface Key {
  id: number; token: string; used: boolean; candidate_id?: number; created_at: string
}

export default function AdminKeysPage() {
  const { id } = useParams<{ id: string }>()
  const [keys, setKeys] = useState<Key[]>([])
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const load = () => adminApi.get(`/elections/${id}/registration_keys`).then((r) => setKeys(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  const generate = async () => {
    setGenerating(true)
    await adminApi.post(`/elections/${id}/registration_keys/generate`, { count }).finally(() => setGenerating(false))
    load()
  }

  const copy = (token: string, keyId: number) => {
    navigator.clipboard.writeText(token)
    setCopied(keyId)
    setTimeout(() => setCopied(null), 2000)
  }

  const unused = keys.filter(k => !k.used)
  const used = keys.filter(k => k.used)

  return (
    <AdminShell title="Registration Keys" subtitle={`Election #${id} · ${unused.length} unused · ${used.length} used`}>
      {/* Mint bar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.375rem' }}>Number of Keys to Mint</label>
          <input type="number" min={1} max={200} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ width: '6rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5625rem 0.75rem', fontSize: '0.9375rem', textAlign: 'center', outline: 'none' }}
          />
        </div>
        <button onClick={generate} disabled={generating}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white',
            padding: '0.5625rem 1.375rem', border: 'none', borderRadius: '0.625rem',
            fontWeight: 700, fontSize: '0.9375rem', cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1, boxShadow: '0 0 12px rgba(245,158,11,0.3)',
          }}>
          {generating ? 'Minting…' : `🔑 Mint ${count} Key${count !== 1 ? 's' : ''}`}
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>{keys.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Keys</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{used.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Used</div>
        </div>
      </div>

      {/* Keys table */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 6rem 5rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', padding: '0.625rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', letterSpacing: '0.06em' }}>
          <span>TOKEN</span><span style={{ textAlign: 'center' }}>STATUS</span><span />
        </div>

        {loading ? (
          <p style={{ padding: '1.5rem', color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center' }}>Loading keys…</p>
        ) : keys.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔑</div>
            <p style={{ margin: 0 }}>No keys yet. Mint some above.</p>
          </div>
        ) : (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {keys.map((k, i) => (
              <div key={k.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 6rem 5rem',
                alignItems: 'center', padding: '0.625rem 1.25rem',
                borderBottom: i < keys.length - 1 ? '1px solid #f8fafc' : 'none',
                background: k.used ? '#fafafa' : 'white',
              }}>
                <code style={{ fontSize: '0.8125rem', color: k.used ? '#94a3b8' : '#374151', fontFamily: 'monospace' }}>{k.token}</code>
                <span style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '99px',
                    background: k.used ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: k.used ? '#dc2626' : '#059669',
                  }}>{k.used ? 'USED' : 'UNUSED'}</span>
                </span>
                <div style={{ textAlign: 'right' }}>
                  {!k.used && (
                    <button onClick={() => copy(k.token, k.id)}
                      style={{
                        fontSize: '0.75rem', padding: '0.25rem 0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem',
                        background: copied === k.id ? '#f0fdf4' : 'white', color: copied === k.id ? '#059669' : '#374151', cursor: 'pointer',
                      }}>
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
