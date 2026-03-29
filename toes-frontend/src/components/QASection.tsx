import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'

interface Question {
  id: number
  body: string
  answered: boolean
  answer: string | null
  created_at: string
}

interface Candidate {
  id: number
  name: string
  position: string
}

function CandidateQA({ candidate }: { candidate: Candidate }) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    api.get(`/candidates/${candidate.id}/questions`).then((r) => setQuestions(r.data))

  useEffect(() => {
    if (open) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, candidate.id])

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
      setError(err.response?.data?.errors?.[0] ?? 'Failed to submit question.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <div>
          <span className="font-semibold text-gray-800">{candidate.name}</span>
          <span className="ml-2 text-xs text-gray-500">{candidate.position}</span>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4">
          {/* Question list */}
          {questions.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No questions yet. Be the first to ask!</p>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-800 font-medium">❓ {q.body}</p>
                  {q.answered && q.answer ? (
                    <p className="mt-1.5 text-sm text-green-700 bg-green-50 rounded px-2 py-1">
                      💬 {q.answer}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400 italic">Awaiting answer…</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Ask a question */}
          {user ? (
            <form onSubmit={submit} className="flex gap-2 pt-1">
              <input
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder={`Ask ${candidate.name} a question…`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button
                type="submit"
                disabled={submitting || !draft.trim()}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-blue-700"
              >
                {submitting ? '…' : 'Ask'}
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-400">Log in to ask a question.</p>
          )}
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      )}
    </div>
  )
}

export default function QASection({ candidates }: { candidates: Candidate[] }) {
  if (candidates.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Candidate Q&amp;A</h2>
      <div className="space-y-2">
        {candidates.map((c) => (
          <CandidateQA key={c.id} candidate={c} />
        ))}
      </div>
    </div>
  )
}
