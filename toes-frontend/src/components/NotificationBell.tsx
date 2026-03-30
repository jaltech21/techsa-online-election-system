import React, { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import cable from '../lib/cable'

interface Announcement {
  id: number
  title: string
  body: string
  election_id: number | null
  posted_by: string
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<number>(() => {
    const s = localStorage.getItem('toes_notif_last_seen')
    return s ? parseInt(s, 10) : 0
  })
  const panelRef = useRef<HTMLDivElement>(null)

  /* ── Load on mount ── */
  useEffect(() => {
    api.get('/announcements')
      .then((r) => setAnnouncements(r.data))
      .catch(() => {/* not critical */})
  }, [])

  /* ── Real-time subscription ── */
  useEffect(() => {
    const sub = cable.subscriptions.create('AnnouncementsChannel', {
      received(a: Announcement) {
        setAnnouncements((prev) =>
          prev.some((x) => x.id === a.id) ? prev : [a, ...prev]
        )
      },
    })
    return () => { sub.unsubscribe() }
  }, [])

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const unread = announcements.filter(
    (a) => new Date(a.created_at).getTime() > lastSeen
  ).length

  const handleOpen = () => {
    setOpen((v) => !v)
    if (!open) {
      const now = Date.now()
      setLastSeen(now)
      localStorage.setItem('toes_notif_last_seen', String(now))
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
        aria-label="Notifications"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Unread badge */}
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-0.5 ring-2 ring-white"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden">
          {/* Header */}
          <div
            className="px-5 py-4 border-b border-slate-100"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <h3 className="text-slate-800 font-extrabold text-[14px] leading-none">Announcements</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Updates from TECHSA Executives</p>
            </div>
            {unread === 0 && announcements.length > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                All caught up
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
            {announcements.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">No announcements yet</p>
                <p className="text-slate-400 text-xs mt-1">Check back later for updates.</p>
              </div>
            ) : (
              announcements.map((a) => {
                const isNew = new Date(a.created_at).getTime() > lastSeen - 2000
                return (
                  <div key={a.id} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${isNew ? 'bg-indigo-50/60' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${isNew ? 'bg-indigo-100' : 'bg-slate-100'}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg className={`w-4 h-4 ${isNew ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <p className={`text-[13px] font-bold leading-snug ${isNew ? 'text-indigo-700' : 'text-slate-800'}`}>
                            {a.title}
                          </p>
                          {isNew && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-slate-500 text-[12px] mt-1 leading-relaxed line-clamp-3">{a.body}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="mt-2">
                          <span className="text-slate-400 text-[11px] font-medium">{a.posted_by}</span>
                          <span className="text-slate-300 text-[11px]">·</span>
                          <span className="text-slate-400 text-[11px]">{timeAgo(a.created_at)}</span>
                          {a.election_id && (
                            <>
                              <span className="text-slate-300 text-[11px]">·</span>
                              <span className="text-indigo-400 text-[11px] font-semibold">Election #{a.election_id}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {announcements.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
              <p className="text-slate-400 text-[11px]">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''} total</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
