import React from 'react'

interface Candidate {
  id: number
  name: string
  position: string
  bio?: string
  photo_url?: string | null
}

interface Props {
  candidate: Candidate
  selected?: boolean
  onSelect?: (id: number) => void
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

export default function CandidateCard({ candidate, selected, onSelect, showVoteCount, voteCount, totalVotes, rank }: Props) {
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

      {/* Select button at bottom */}
      {onSelect && (
        <div className="px-5 pb-5 pt-3">
          <div className={`py-2.5 rounded-xl text-center text-sm font-bold transition-all ${
            selected
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
          }`}>
            {selected ? '✓ Your choice' : 'Select candidate'}
          </div>
        </div>
      )}
    </div>
  )
}
