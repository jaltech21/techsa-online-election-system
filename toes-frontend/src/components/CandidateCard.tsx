import React from 'react'
import type { DrawerTab } from './CandidateDrawer'

interface Candidate {
  id: number
  name: string
  position: string
  bio?: string
  manifesto?: string
  photo_url?: string | null
}

interface Props {
  candidate: Candidate
  selected?: boolean
  onSelect?: (id: number) => void
  onOpen?: (tab: DrawerTab) => void
  showVoteCount?: boolean
  voteCount?: number
  totalVotes?: number
  rank?: number
}

// Generate a consistent gradient from name
function avatarGradient(name: string) {
  const gradients = [
    'from-indigo-500 to-violet-600',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-700',
    'from-indigo-400 to-blue-600',
    'from-purple-500 to-indigo-700',
  ]
  const idx = name.charCodeAt(0) % gradients.length
  return gradients[idx]
}

const medals = ['🥇', '🥈', '🥉']

export default function CandidateCard({ candidate, selected, onSelect, onOpen, showVoteCount, voteCount, totalVotes, rank }: Props) {
  const pct = totalVotes && (voteCount ?? 0) > 0 ? Math.round(((voteCount ?? 0) / totalVotes) * 100) : 0

  /* ── RESULTS LEADERBOARD CARD ── */
  if (showVoteCount) {
    return (
        <div className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-4 transition-all ${
        rank === 1 ? 'border-indigo-400 shadow-lg shadow-indigo-100' : 'border-slate-100 shadow-sm'
      }`}>
        {/* Rank */}
        <div className="shrink-0 w-10 text-center">
          {rank && rank <= 3
            ? <span className="text-2xl">{medals[rank - 1]}</span>
            : <span className="text-slate-400 font-bold text-lg">#{rank}</span>}
        </div>

        {/* Avatar */}
        {candidate.photo_url ? (
          <img src={candidate.photo_url} alt={candidate.name}
            className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow shrink-0" />
        ) : (
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient(candidate.name)} flex items-center justify-center text-xl font-extrabold text-white ring-4 ring-white shadow shrink-0`}>
            {candidate.name[0]}
          </div>
        )}

        {/* Info + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-bold text-slate-800 text-[15px] leading-tight">{candidate.name}</h3>
              <p className="text-indigo-500 text-[11px] font-bold uppercase tracking-widest mt-0.5">{candidate.position}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-extrabold text-indigo-600">{voteCount ?? 0}</span>
              <span className="text-slate-400 text-xs ml-1">votes</span>
              {totalVotes ? <p className="text-slate-400 text-[11px]">{pct}%</p> : null}
            </div>
          </div>
          {/* Vote bar */}
          <div className="mt-2.5 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* Quick-access links for results view */}
          {onOpen && (
            <div style={{ display: 'flex', gap: '8px' }} className="mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); onOpen('manifesto') }}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition"
              >
                Manifesto
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onOpen('qa') }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
              >
                Q&amp;A
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── VOTING PROFILE CARD ── */
  return (
    <div
      onClick={() => onSelect?.(candidate.id)}
      className={`rounded-2xl overflow-hidden border-2 transition-all duration-150 bg-white flex flex-col
        ${onSelect ? 'cursor-pointer' : 'cursor-default'}
        ${selected
          ? 'border-indigo-500 shadow-xl shadow-indigo-100 ring-2 ring-indigo-200'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
        }`}
    >
      {/* Photo / Avatar area */}
      <div className={`flex flex-col items-center pt-8 pb-6 px-6 relative transition-colors ${
        selected ? 'bg-indigo-50' : 'bg-gradient-to-b from-slate-50 to-white'
      }`}>
        {selected && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Selected
            </span>
          </div>
        )}

        {candidate.photo_url ? (
          <img
            src={candidate.photo_url}
            alt={candidate.name}
            className={`w-24 h-24 rounded-full object-cover shadow-lg mb-4 ring-4 transition-all ${
              selected ? 'ring-indigo-400 scale-105' : 'ring-white'
            }`}
          />
        ) : (
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarGradient(candidate.name)} flex items-center justify-center text-3xl font-extrabold text-white shadow-lg mb-4 ring-4 transition-all ${
            selected ? 'ring-indigo-300 scale-105' : 'ring-white'
          }`}>
            {candidate.name[0]}
          </div>
        )}

        <h3 className="font-extrabold text-slate-800 text-base text-center leading-tight">{candidate.name}</h3>
        <span className="inline-block mt-2 bg-indigo-100 text-indigo-700 text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
          {candidate.position}
        </span>
      </div>

      {/* Bio */}
      {candidate.bio ? (
        <div className="px-5 py-4 border-t border-slate-100 flex-1">
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 italic text-center">&ldquo;{candidate.bio}&rdquo;</p>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Select button + action buttons at bottom */}
      {onSelect && (
        <div className="px-5 pb-5 pt-3 space-y-2">
          <div className={`py-2.5 rounded-xl text-center text-sm font-bold transition-all ${
            selected
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {selected ? '✓ Your choice' : 'Select candidate'}
          </div>
          {onOpen && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpen('manifesto') }}
                className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition flex items-center justify-center gap-1.5"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Manifesto
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpen('qa') }}
                className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Q&amp;A
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
