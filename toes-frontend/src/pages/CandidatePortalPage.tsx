import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { PageLayout } from '../components/Navbar'

/* ── Types ─────────────────────────────────────────────────── */
interface CandidateProfile {
  id: number
  name: string
  position: string
  bio: string | null
  manifesto: string | null
  video_url: string | null
  election_id: number
  photo_url: string | null
  answered_count: number
  pending_questions: number
}

interface ElectionInfo {
  id: number
  title: string
  status: string
}

interface Question {
  id: number
  body: string
  answered: boolean
  answer: string | null
  pinned: boolean
  created_at: string
}

type Tab = 'overview' | 'profile' | 'questions'

/* ── Avatar ─────────────────────────────────────────────────── */
function CandidateAvatar({ url, name, size = 'md' }: { url: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'w-24 h-24 text-3xl' : size === 'sm' ? 'w-10 h-10 text-sm' : 'w-16 h-16 text-xl'
  const initials = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (url) return <img src={url} alt={name} className={`${dim} rounded-full object-cover`} />
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white`}>
      {initials}
    </div>
  )
}

/* ── Status badge ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  if (status === 'open') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      LIVE
    </span>
  )
  if (status === 'draft') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      UPCOMING
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-500 text-xs font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      CLOSED
    </span>
  )
}

/* ── Overview Tab ───────────────────────────────────────────── */
function OverviewTab({ candidate, election }: { candidate: CandidateProfile; election: ElectionInfo | null }) {
  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-32 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white translate-y-20 -translate-x-10" />
        </div>
        <div className="relative flex items-center gap-5">
          <div className="ring-4 ring-white/30 rounded-full">
            <CandidateAvatar url={candidate.photo_url} name={candidate.name} size="lg" />
          </div>
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Your Campaign</p>
            <h2 className="text-2xl font-bold leading-tight">{candidate.name}</h2>
            <p className="text-indigo-200 text-sm mt-0.5">{candidate.position}</p>
            {election && (
              <div className="flex items-center gap-2 mt-3">
                <StatusBadge status={election.status} />
                <span className="text-white/70 text-xs">{election.title}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <MetricTile
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Answered Q&A"
          value={candidate.answered_count}
          color="indigo"
        />
        <MetricTile
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
          label="Pending Questions"
          value={candidate.pending_questions}
          color={candidate.pending_questions > 0 ? 'amber' : 'slate'}
        />
        <MetricTile
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
          label="Candidate Status"
          value="Registered"
          color="emerald"
          text
        />
      </div>

      {/* Campaign snapshot */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900">Campaign Snapshot</h3>
        {candidate.bio && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Bio</p>
            <p className="text-sm text-slate-700 leading-relaxed">{candidate.bio}</p>
          </div>
        )}
        {candidate.manifesto && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Manifesto</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-6">{candidate.manifesto}</p>
          </div>
        )}
        {!candidate.bio && !candidate.manifesto && (
          <p className="text-sm text-slate-400 italic">No campaign content yet. Go to My Profile to add your bio and manifesto.</p>
        )}
      </div>
    </div>
  )
}

function MetricTile({ icon, label, value, color, text }: { icon: React.ReactNode; label: string; value: string | number; color: string; text?: boolean }) {
  const bg = { indigo: 'bg-indigo-50', amber: 'bg-amber-50', slate: 'bg-slate-50', emerald: 'bg-emerald-50' }[color] ?? 'bg-slate-50'
  const ic = { indigo: 'text-indigo-600', amber: 'text-amber-600', slate: 'text-slate-400', emerald: 'text-emerald-600' }[color] ?? 'text-slate-600'
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className={`w-10 h-10 ${bg} ${ic} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <p className={`font-bold text-slate-900 ${text ? 'text-sm' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
    </div>
  )
}

/* ── Profile Edit Tab ──────────────────────────────────────── */
function ProfileTab({ candidate, onSaved }: { candidate: CandidateProfile; onSaved: (c: CandidateProfile) => void }) {
  const [form, setForm] = useState({ bio: candidate.bio ?? '', manifesto: candidate.manifesto ?? '', video_url: candidate.video_url ?? '' })
  const [photo, setPhoto] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const fd = new FormData()
      if (form.bio) fd.append('bio', form.bio)
      if (form.manifesto) fd.append('manifesto', form.manifesto)
      if (form.video_url) fd.append('video_url', form.video_url)
      if (photo) fd.append('photo', photo)

      const res = await api.patch('/candidates/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onSaved(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      const msgs = err.response?.data?.errors ?? [err.response?.data?.error ?? 'Save failed.']
      setError(msgs.join(', '))
    } finally {
      setSaving(false)
    }
  }

  const previewUrl = photo ? URL.createObjectURL(photo) : candidate.photo_url

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-slate-900 text-lg">Edit Campaign Profile</h3>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {/* Photo */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Campaign Photo</label>
          <div className="flex items-center gap-4">
            <div className="ring-2 ring-slate-200 rounded-full">
              {previewUrl
                ? <img src={previewUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">{candidate.name.charAt(0)}</div>
              }
            </div>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()} className="text-xs border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition">
                {photo ? 'Change' : 'Upload new photo'}
              </button>
              <p className="text-[11px] text-slate-400 mt-1">JPG, PNG — max 5 MB</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Short Bio</label>
          <textarea
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            value={form.bio}
            onChange={set('bio')}
            placeholder="Tell voters about yourself…"
          />
        </div>

        {/* Manifesto */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Manifesto</label>
          <textarea
            rows={8}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            value={form.manifesto}
            onChange={set('manifesto')}
            placeholder={"• Improve student welfare\n• Increase transparency\n…"}
          />
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Campaign Video URL</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            value={form.video_url}
            onChange={set('video_url')}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
        >
          {saving ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>Saving…</>
          ) : saved ? (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Saved!</>
          ) : 'Save Changes'}
        </button>
      </div>

      {/* Live preview */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Live Preview</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
          <div className="px-5 pb-5">
            <div className="flex items-end gap-3 -mt-8 mb-3">
              <div className="ring-4 ring-white rounded-full">
                {previewUrl
                  ? <img src={previewUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                  : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">{candidate.name.charAt(0)}</div>
                }
              </div>
              <div className="pb-1">
                <h3 className="font-bold text-slate-900">{candidate.name}</h3>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">{candidate.position}</span>
              </div>
            </div>
            {form.bio && <p className="text-xs text-slate-600 leading-relaxed mb-3">{form.bio}</p>}
            {form.manifesto && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Manifesto</p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-8">{form.manifesto}</p>
              </div>
            )}
            {form.video_url && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Campaign Video</p>
                <p className="text-xs text-indigo-500 truncate">{form.video_url}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Questions Tab ──────────────────────────────────────────── */
function QuestionsTab({ candidateId }: { candidateId: number }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [replyDraft, setReplyDraft] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState<number | null>(null)

  useEffect(() => {
    api.get(`/candidates/${candidateId}/questions`).then(r => {
      setQuestions(r.data)
    }).finally(() => setLoading(false))
  }, [candidateId])

  const submitAnswer = async (qId: number) => {
    const answer = replyDraft[qId]?.trim()
    if (!answer) return
    setSubmitting(qId)
    try {
      const res = await api.patch(`/questions/${qId}/my_answer`, { answer })
      setQuestions(qs => qs.map(q => q.id === qId ? { ...q, answered: true, answer: res.data.answer } : q))
      setReplyDraft(d => { const n = { ...d }; delete n[qId]; return n })
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
      </div>
    )
  }

  const pending = questions.filter(q => !q.answered)
  const answered = questions.filter(q => q.answered)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900 text-lg">Q&amp;A Inbox</h2>
        <div className="flex gap-2 text-xs">
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">{pending.length} pending</span>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">{answered.length} answered</span>
        </div>
      </div>

      {questions.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <p className="font-medium">No questions yet</p>
          <p className="text-sm mt-1">When voters ask you questions, they'll appear here.</p>
        </div>
      )}

      {/* Pending questions */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Awaiting your reply</p>
          {pending.map(q => (
            <div key={q.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-800 leading-relaxed">{q.body}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{new Date(q.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="pl-11">
                  <textarea
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    placeholder="Type your reply here…"
                    value={replyDraft[q.id] ?? ''}
                    onChange={e => setReplyDraft(d => ({ ...d, [q.id]: e.target.value }))}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => submitAnswer(q.id)}
                      disabled={!replyDraft[q.id]?.trim() || submitting === q.id}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                    >
                      {submitting === q.id ? 'Posting…' : 'Post Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Answered questions */}
      {answered.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Answered</p>
          {answered.map(q => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{q.body}</p>
                </div>
                <div className="pl-11 border-l-2 border-indigo-200 ml-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Your reply</p>
                      <p className="text-sm text-slate-800 leading-relaxed">{q.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main Portal Page ───────────────────────────────────────── */
export default function CandidatePortalPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) ?? 'overview')
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null)

  useEffect(() => {
    setTab((searchParams.get('tab') as Tab) ?? 'overview')
  }, [searchParams])

  const switchTab = (t: Tab) => {
    navigate(t === 'overview' ? '/candidate/portal' : `/candidate/portal?tab=${t}`, { replace: true })
  }
  const [election, setElection] = useState<ElectionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get('/candidates/me')
      .then(async r => {
        setCandidate(r.data)
        try {
          const el = await api.get(`/elections/${r.data.election_id}`)
          setElection({ id: el.data.id, title: el.data.title, status: el.data.status })
        } catch {}
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-32">
          <svg className="w-8 h-8 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
        </div>
      </PageLayout>
    )
  }

  if (notFound || !candidate) {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto mt-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No candidate profile found</h2>
          <p className="text-slate-500 text-sm mb-6">You are not registered as a candidate. Use a registration key provided by an administrator to register.</p>
          <button
            onClick={() => navigate('/candidates/register')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
          >
            Register as a Candidate
          </button>
        </div>
      </PageLayout>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview', label: 'Overview', icon:
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      id: 'profile', label: 'My Profile', icon:
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    },
    {
      id: 'questions', label: 'Questions',
      icon: (
        <span className="relative">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          {candidate.pending_questions > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{candidate.pending_questions}</span>
          )}
        </span>
      )
    },
  ]

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto py-2">
        {/* Page title */}
        <div className="mb-6">
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1">Candidate Portal</p>
          <h1 className="text-2xl font-bold text-slate-900">My Campaign</h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && <OverviewTab candidate={candidate} election={election} />}
        {tab === 'profile' && <ProfileTab candidate={candidate} onSaved={setCandidate} />}
        {tab === 'questions' && <QuestionsTab candidateId={candidate.id} />}
      </div>
    </PageLayout>
  )
}
