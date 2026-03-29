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
      className={`border-2 rounded-xl p-4 flex gap-4 transition cursor-pointer
        ${onSelect ? 'hover:border-blue-400' : 'cursor-default'}
        ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
    >
      {candidate.photo_url ? (
        <img
          src={candidate.photo_url}
          alt={candidate.name}
          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
          {candidate.name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight">{candidate.name}</h3>
          {selected && <span className="text-blue-600 font-bold text-sm">✔ Selected</span>}
          {showVoteCount && (
            <span className="text-sm text-gray-600 font-medium">{voteCount ?? 0} votes</span>
          )}
        </div>
        <p className="text-blue-700 text-sm font-medium">{candidate.position}</p>
        {candidate.bio && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{candidate.bio}</p>}
      </div>
    </div>
  )
}
