import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AdminShell from '../../components/admin/AdminShell'

const adminApi = axios.create({ baseURL: '/api/v1' })
adminApi.interceptors.request.use((config) => {
  const t = localStorage.getItem('admin_token')
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

interface Announcement {
  id: number
  title: string
  body: string
  election_id: number | null
  posted_by: string
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = () =>
    adminApi.get('/admin/announcements').then((r) => setAnnouncements(r.data))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setFormError('Title and message are required.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      await adminApi.post('/admin/announcements', {
        announcement: { title: title.trim(), body: body.trim() },
      })
      setTitle('')
      setBody('')
      await load()
    } catch (err: any) {
      setFormError(err.response?.data?.errors?.[0] ?? 'Failed to post announcement.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await adminApi.delete(`/admin/announcements/${id}`)
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminShell title="Announcements" subtitle="Broadcast messages to all voters in real-time">
      {/* Compose form */}
      <div style={{
        background: 'white', border: '1px solid #e2e8f0',
        borderRadius: '0.875rem', padding: '1.5rem', marginBottom: '1.5rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b' }}>
          📢 Post New Announcement
        </h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>
              Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Voting is now open!"
              style={{
                width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem', fontSize: '0.875rem',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>
              Message <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Write your announcement here…"
              style={{
                width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem', fontSize: '0.875rem', resize: 'vertical',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>
          {formError && (
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#ef4444' }}>{formError}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? '#a5b4fc' : '#4f46e5',
                color: 'white', border: 'none', borderRadius: '0.5rem',
                padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
              }}
            >
              {submitting ? 'Posting…' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>

      {/* Announcement list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem',
              padding: '1.25rem', height: '5rem',
              animation: 'skeleton 1.4s ease-in-out infinite',
            }}>
              <div style={{ height: '0.875rem', background: '#e2e8f0', borderRadius: '0.375rem', width: '40%', marginBottom: '0.5rem' }} />
              <div style={{ height: '0.625rem', background: '#f1f5f9', borderRadius: '0.375rem', width: '70%' }} />
            </div>
          ))}
          <style>{`@keyframes skeleton { 0%,100%{opacity:1} 50%{opacity:0.55} }`}</style>
        </div>
      ) : announcements.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem', color: '#94a3b8',
          background: 'white', borderRadius: '0.875rem', border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📢</div>
          <p style={{ margin: 0 }}>No announcements yet. Use the form above to post one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {announcements.map((a) => (
            <div key={a.id} style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '0.875rem', padding: '1.125rem 1.25rem',
              display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
            }}>
              <div style={{
                width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', flexShrink: 0,
                background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
              }}>📢</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b' }}>
                  {a.title}
                </p>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#475569', whiteSpace: 'pre-wrap' }}>
                  {a.body}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                  Posted by {a.posted_by} · {formatDate(a.created_at)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                disabled={deletingId === a.id}
                style={{
                  flexShrink: 0, background: 'transparent', border: '1px solid #fca5a5',
                  borderRadius: '0.5rem', padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem', fontWeight: 600, color: '#ef4444',
                  cursor: deletingId === a.id ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                  opacity: deletingId === a.id ? 0.5 : 1,
                }}
                onMouseEnter={(e) => { (e.currentTarget.style.background = '#fef2f2') }}
                onMouseLeave={(e) => { (e.currentTarget.style.background = 'transparent') }}
              >
                {deletingId === a.id ? '…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
