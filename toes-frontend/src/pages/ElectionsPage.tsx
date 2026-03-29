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

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ElectionCard({ e }: { e: Election }) {
  const isOpen   = e.status === 'open'
  const isClosed = e.status === 'closed'

  const accent = isOpen
    ? 'from-emerald-500 to-teal-500'
    : isClosed ? 'from-rose-500 to-pink-500'
    : 'from-slate-400 to-slate-500'

  const border = isOpen
    ? 'border-emerald-200 hover:border-emerald-400'
    : isClosed ? 'border-slate-200 hover:border-slate-300'
    : 'border-amber-200 hover:border-amber-300'

  const iconBg = isOpen ? 'bg-emerald-100' : isClosed ? 'bg-rose-100' : 'bg-amber-100'
  const iconColor = isOpen ? 'text-emerald-600' : isClosed ? 'text-rose-500' : 'text-amber-600'

  const statusLabel = isOpen ? 'Open' : isClosed ? 'Closed' : 'Draft'
  const statusCls   = isOpen ? 'badge-open' : isClosed ? 'badge-closed' : 'badge-draft'
  const liveText    = isOpen ? 'Voting live now' : isClosed ? 'Voting ended' : 'Coming soon'
  const dotCls      = isOpen ? 'bg-emerald-500 animate-pulse' : isClosed ? 'bg-rose-400' : 'bg-amber-400'

  return (
    <Link
      to={`/elections/${e.id}`}
      className={`group bg-white rounded-2xl border-2 ${border} shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col`}
    >
      {/* Gradient accent bar */}
      <div className={`h-1 bg-gradient-to-r ${accent}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Top row: icon + status badge */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', marginBottom:'14px' }}>
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className={statusCls}>{statusLabel}</span>
        </div>

        {/* Title */}
        <h2 className="text-[16px] font-extrabold text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors">
          {e.title}
        </h2>

        {/* Description */}
        {e.description && (
          <p className="text-slate-500 text-[13px] mt-1.5 line-clamp-2 leading-relaxed">{e.description}</p>
        )}

        {/* Date range */}
        {(e.starts_at || e.ends_at) && (
          <div style={{ display:'flex', alignItems:'center', gap:'5px' }} className="mt-3">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[12px] text-slate-400">
              {[e.starts_at && fmtDate(e.starts_at), e.ends_at && fmtDate(e.ends_at)].filter(Boolean).join(' – ')}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}
             className="mt-5 pt-4 border-t border-slate-100">
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotCls}`} />
            <span className="text-[12px] text-slate-500 font-medium">{liveText}</span>
          </div>
          <span className="text-indigo-500 text-[12px] font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            View
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

const STATS = [
  {
    key: 'active', label: 'Active Elections', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
    icon: (
      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'closed', label: 'Closed Elections', color: 'text-slate-600', bg: 'bg-white', border: 'border-slate-200',
    icon: (
      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    key: 'draft', label: 'Upcoming', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/elections').then((r) => setElections(r.data)).finally(() => setLoading(false))
  }, [])

  const open   = elections.filter((e) => e.status === 'open')
  const closed = elections.filter((e) => e.status === 'closed')
  const draft  = elections.filter((e) => e.status === 'draft')
  const counts: Record<string, number> = { active: open.length, closed: closed.length, draft: draft.length }

  if (loading) return (
    <PageLayout>
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded-xl w-40" />
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-200 h-24" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0,1,2].map(i => (
            <div key={i} className="bg-white rounded-2xl border-2 border-slate-200 h-48">
              <div className="h-1 bg-slate-200 rounded-t-xl" />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900">Elections</h1>
        <p className="text-slate-500 text-sm mt-0.5">Review active elections and cast your vote.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.key} className={`${s.bg} border ${s.border} rounded-2xl px-5 py-4`}
               style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px' }}>
            <div>
              <p className={`text-3xl font-extrabold leading-none ${s.color}`}>{counts[s.key]}</p>
              <p className="text-[12px] text-slate-500 font-medium mt-1.5">{s.label}</p>
            </div>
            <div className="mt-0.5">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Election sections */}
      {elections.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="font-bold text-slate-700">No elections yet</p>
          <p className="text-slate-400 text-sm mt-1">Check back later.</p>
        </div>
      ) : (
        <div className="space-y-10">

          {open.length > 0 && (
            <section>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }} className="mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h2 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.12em]">Live Now</h2>
                <span className="ml-auto text-[12px] text-slate-400">{open.length} election{open.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {open.map(e => <ElectionCard key={e.id} e={e} />)}
              </div>
            </section>
          )}

          {draft.length > 0 && (
            <section>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }} className="mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <h2 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.12em]">Upcoming</h2>
                <span className="ml-auto text-[12px] text-slate-400">{draft.length} election{draft.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {draft.map(e => <ElectionCard key={e.id} e={e} />)}
              </div>
            </section>
          )}

          {closed.length > 0 && (
            <section>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }} className="mb-4">
                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                <h2 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.12em]">Past Elections</h2>
                <span className="ml-auto text-[12px] text-slate-400">{closed.length} election{closed.length > 1 ? 's' : ''}</span>
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
