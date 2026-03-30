import React, { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'

export type DrawerTab = 'manifesto' | 'qa'

interface Candidate {
  id: number
  name: string
  position: string
  bio?: string
  manifesto?: string
  video_url?: string
  photo_url?: string | null
}

interface Question {
  id: number
  body: string
  answered: boolean
  answer: string | null
  pinned: boolean
  created_at: string
}

interface Props {
  candidate: Candidate | null
  initialTab?: DrawerTab
  onClose: () => void
}

function avatarGradient(name: string) {
  const gs = [
    'from-indigo-500 to-violet-600',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-700',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-teal-600',
  ]
  return gs[name.charCodeAt(0) % gs.length]
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/* ── Q&A tab content ──────────────────────────────────────── */
function QATab({ candidate }: { candidate: Candidate }) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = () =>
    api.get(`/candidates/${candidate.id}/questions`)
      .then((r) => setQuestions(r.data))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [candidate.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [questions.length])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/candidates/${candidate.id}/questions`, { body: draft.trim() })
      setDraft('')
      load()
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Failed to submit.')
    } finally {
      setSubmitting(false)
    }
  }

  const answered = questions.filter((q) => q.answered)
  const pending  = questions.filter((q) => !q.answered)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-500 font-semibold text-sm">No questions yet</p>
            <p className="text-slate-400 text-xs mt-1">Be the first to engage with {candidate.name}!</p>
          </div>
        ) : (
          <>
            {/* Answered questions */}
            {answered.map((q) => (
              <div key={q.id} className="space-y-2">
                {/* Student question */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      {q.pinned && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="mb-1.5">
                          <span className="text-[10px]">📌</span>
                          <span className="text-amber-600 text-[10px] font-bold uppercase tracking-wide">Pinned</span>
                        </div>
                      )}
                      <p className="text-slate-700 text-[13px] leading-relaxed">{q.body}</p>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1 ml-1">{timeAgo(q.created_at)}</p>
                  </div>
                </div>
                {/* Candidate answer */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexDirection: 'row-reverse' }}>
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient(candidate.name)} flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 mt-0.5`}>
                    {candidate.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                      <p className="text-[13px] leading-relaxed">{q.answer}</p>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1 mr-1 text-right">{candidate.name}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Pending questions */}
            {pending.map((q) => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-slate-700 text-[13px] leading-relaxed">{q.body}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }} className="mt-1 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <p className="text-amber-500 text-[11px] font-medium">Awaiting answer</p>
                  </div>
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Ask input */}
      <div className="border-t border-slate-100 px-5 py-4 bg-white">
        {user ? (
          <form onSubmit={submit} className="space-y-2">
            <textarea
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400 leading-relaxed"
              placeholder={`Ask ${candidate.name} a question…`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e as any) } }}
            />
            {error && <p className="text-rose-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !draft.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit Question'}
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 rounded-xl px-4 py-3 text-center">
            <p className="text-slate-500 text-sm">
              <a href="/login" className="text-indigo-600 font-semibold hover:underline">Log in</a> to ask a question.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Manifesto tab content ────────────────────────────────── */
function ManifestoTab({ candidate }: { candidate: Candidate }) {
  if (!candidate.manifesto?.trim() && !candidate.video_url?.trim()) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-500 font-semibold text-sm">No manifesto uploaded yet</p>
        <p className="text-slate-400 text-xs mt-1">{candidate.name} hasn't shared their manifesto or video.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {/* Video clip */}
      {candidate.video_url?.trim() && (() => {
        const embedUrl = isYouTube(candidate.video_url!) ? videoEmbedUrl(candidate.video_url!) : null
        return (
          <div className="mb-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mb-3">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-800 font-bold text-[13px]">Campaign Video</p>
            </div>
            {embedUrl ? (
              <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={embedUrl}
                  title={`${candidate.name} campaign video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <video
                src={candidate.video_url!}
                controls
                className="w-full rounded-2xl bg-black"
                style={{ maxHeight: '240px' }}
              />
            )}
          </div>
        )
      })()}

      {/* Manifesto header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mb-5">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-slate-800 font-bold text-[13px] leading-none">Election Manifesto</p>
          <p className="text-slate-400 text-[11px] mt-0.5">{candidate.name} · {candidate.position}</p>
        </div>
      </div>

      {/* Body */}
      {candidate.manifesto?.trim() && (
        <>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
            <p className="text-slate-700 text-sm leading-[1.8] whitespace-pre-wrap">{candidate.manifesto}</p>
          </div>
          <p className="text-slate-400 text-[11px] mt-3 text-right">
            {candidate.manifesto!.split(/\s+/).filter(Boolean).length} words
          </p>
        </>
      )}
    </div>
  )
}

/* ── Video section (shown above manifesto text if video_url set) ─ */
function isYouTube(url: string) {
  return /youtu\.?be/.test(url)
}

function videoEmbedUrl(url: string) {
  // Handle youtube.com/watch?v=ID and youtu.be/ID
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}
export default function CandidateDrawer({ candidate, initialTab = 'manifesto', onClose }: Props) {
  const [tab, setTab] = useState<DrawerTab>(initialTab)

  // Sync tab when drawer reopens for a different CTAs
  useEffect(() => { setTab(initialTab) }, [candidate?.id, initialTab])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!candidate) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            {/* Avatar */}
            {candidate.photo_url ? (
              <img src={candidate.photo_url} alt={candidate.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow shrink-0" />
            ) : (
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGradient(candidate.name)} flex items-center justify-center text-2xl font-extrabold text-white shadow shrink-0`}>
                {candidate.name[0]}
              </div>
            )}
            {/* Name / position */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-slate-900 font-extrabold text-[17px] leading-tight truncate">{candidate.name}</h2>
              <span className="inline-block mt-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                {candidate.position}
              </span>
              {candidate.bio && (
                <p className="text-slate-400 text-[12px] mt-2 leading-relaxed line-clamp-2 italic">
                  "{candidate.bio}"
                </p>
              )}
            </div>
            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition shrink-0"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex' }} className="px-5 pt-3 pb-0 gap-1 border-b border-slate-100">
          {([
            { key: 'manifesto', label: 'Manifesto', icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )},
            { key: 'qa', label: 'Q&A Feed', icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )},
          ] as const).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-all -mb-px ${
                tab === key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {tab === 'manifesto'
            ? <ManifestoTab candidate={candidate} />
            : <QATab candidate={candidate} />
          }
        </div>
      </div>
    </>
  )
}
