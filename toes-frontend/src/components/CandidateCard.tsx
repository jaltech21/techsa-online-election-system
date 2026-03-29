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
      className={`rounded-2xl p-4 flex gap-4 border-2 transition-all duration-150
        ${onSelect ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
        ${selected
          ? 'border-indigo-500 bg-indigo-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-indigo-300'
        }`}
    >
      {candidate.photo_url ? (
        <img
          src={candidate.photo_url}
          alt={candidate.name}
          className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-sm"
        />
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 flex-shrink-0">
          {candidate.name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="font-bold text-slate-800 text-base leading-tight">{candidate.name}</h3>
          {selected && (
            <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              ✓ Selected
            </span>
          )}
          {showVoteCount && (
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              {voteCount ?? 0} votes
            </span>
          )}
        </div>
        <p className="text-indigo-600 text-xs font-semibold mt-0.5 uppercase tracking-wide">{candidate.position}</p>
        {candidate.bio && <p className="text-slate-500 text-sm mt-1.5 line-clamp-2">{candidate.bio}</p>}
      </div>
    </div>
  )
}
