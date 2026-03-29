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
}

export default function CandidateCard({ candidate, selected, onSelect, showVoteCount, voteCount }: Props) {
  return (
    <div
      onClick={() => onSelect?.(candidate.id)}
      className={`rounded-2xl p-4 flex gap-4 border-2 transition-all duration-150 relative
        ${onSelect ? 'cursor-pointer' : 'cursor-default'}
        ${selected
          ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
        }`}
    >
      {/* Selection indicator strip */}
      {selected && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-full" />
      )}

      {/* Avatar */}
      {candidate.photo_url ? (
        <img
          src={candidate.photo_url}
          alt={candidate.name}
          className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 shadow-sm"
        />
      ) : (
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold flex-shrink-0 transition-colors ${
          selected ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-100 text-indigo-500'
        }`}>
          {candidate.name[0]}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="font-bold text-slate-800 text-[15px] leading-tight">{candidate.name}</h3>
          {selected && (
            <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Selected
            </span>
          )}
          {showVoteCount && (
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
              {voteCount ?? 0} votes
            </span>
          )}
        </div>
        <p className="text-indigo-500 text-[11px] font-bold mt-0.5 uppercase tracking-widest">{candidate.position}</p>
        {candidate.bio && <p className="text-slate-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">{candidate.bio}</p>}
      </div>

      {/* Radio indicator */}
      {onSelect && !showVoteCount && (
        <div className={`shrink-0 self-center w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
        }`}>
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      )}
    </div>
  )
}
