import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { PageLayout } from '../components/Navbar'

interface Election {
  id: number
  title: string
  description?: string
  status: 'draft' | 'open' | 'closed'
  starts_at?: string
  ends_at?: string
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string; card: string }> = {
  open:   { label: 'Open',   dot: 'bg-emerald-500', badge: 'badge-open',   card: 'border-emerald-200 hover:border-emerald-400' },
  closed: { label: 'Closed', dot: 'bg-rose-400',    badge: 'badge-closed', card: 'border-slate-200 hover:border-slate-300' },
  draft:  { label: 'Draft',  dot: 'bg-slate-400',   badge: 'badge-draft',  card: 'border-slate-200 hover:border-indigo-300' },
}

function ElectionCard({ e }: { e: Election }) {
  const cfg = STATUS_CONFIG[e.status] ?? STATUS_CONFIG.draft
  const dateRange = e.starts_at || e.ends_at
    ? [e.starts_at && new Date(e.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
       e.ends_at   && new Date(e.ends_at).toLocaleDateString('en-GB',   { day: 'numeric', month: 'short', year: 'numeric' })]
      .filter(Boolean).join(' – ')
    : null

  return (
    <Link
      to={`/elections/${e.id}`}
      className={`group bg-white rounded-2xl border-2 ${cfg.card} shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col`}
    >
      {/* Coloured top accent */}
      <div className={`h-1.5 w-full ${
        e.status === 'open' ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
        : e.status === 'closed' ? 'bg-gradient-to-r from-rose-400 to-pink-500'
        : 'bg-gradient-to-r from-slate-300 to-slate-400'
      }`} />

      <div className="p-6 flex-1 flex flex-col">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className={cfg.badge}>{cfg.label}</span>
        </div>

        {/* Title & description */}
        <h2 className="text-[17px] font-extrabold text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors">
          {e.title}
        </h2>
        {e.description && (
          <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">{e.description}</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer row */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cfg.dot} ${
              e.status === 'open' ? 'animate-pulse' : ''
            }`} />
            <span className="text-xs text-slate-500 font-medium">
              {e.status === 'open' ? 'Voting live now' : e.status === 'closed' ? 'Ended' : 'Coming soon'}
            </span>
          </div>
          {dateRange && <span className="text-xs text-slate-400">{dateRange}</span>}
          <span className="text-indigo-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/elections').then((r) => setElections(r.data)).finally(() => setLoading(false))
  }, [])

  const open   = elections.filter((e) => e.status === 'open')
  const closed = elections.filter((e) => e.status === 'closed')
  const draft  = elections.filter((e) => e.status === 'draft')

  if (loading) return (
    <PageLayout>
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded-xl w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0,1,2].map(i => (
            <div key={i} className="bg-white rounded-2xl border-2 border-slate-200 p-6 h-52">
              <div className="h-11 w-11 bg-slate-200 rounded-xl mb-4" />
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full mb-1" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🗳️</span>
          <h1 className="text-2xl font-extrabold text-slate-800">Elections</h1>
        </div>
        <p className="text-slate-500 text-sm">Review active elections and cast your vote.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active', count: open.length,   color: 'text-emerald-600', bg: 'bg-emerald-50  border-emerald-100' },
          { label: 'Closed', count: closed.length, color: 'text-rose-500',    bg: 'bg-rose-50    border-rose-100' },
          { label: 'Draft',  count: draft.length,  color: 'text-slate-500',   bg: 'bg-slate-50   border-slate-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl px-5 py-4`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {elections.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🗳️</div>
          <p className="font-bold text-slate-700">No elections yet</p>
          <p className="text-slate-400 text-sm mt-1">Check back later.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {open.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="font-extrabold text-slate-700 text-sm uppercase tracking-widest">Live Now</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {open.map(e => <ElectionCard key={e.id} e={e} />)}
              </div>
            </section>
          )}
          {draft.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h2 className="font-extrabold text-slate-700 text-sm uppercase tracking-widest">Upcoming</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {draft.map(e => <ElectionCard key={e.id} e={e} />)}
              </div>
            </section>
          )}
          {closed.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <h2 className="font-extrabold text-slate-700 text-sm uppercase tracking-widest">Past Elections</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {closed.map(e => <ElectionCard key={e.id} e={e} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </PageLayout>
  )
}
