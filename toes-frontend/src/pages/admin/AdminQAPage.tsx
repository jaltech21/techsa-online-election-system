import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'

// Shared axios instance that adds admin Bearer token
import axios from 'axios'
const questionsApi = axios.create({ baseURL: '/api/v1' })
questionsApi.interceptors.request.use((config) => {
  const t = localStorage.getItem('admin_token')
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

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

function CandidateQAPanel({ candidate }: { candidate: Candidate }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState<number | null>(null)

  const load = () =>
    api
      .get(`/candidates/${candidate.id}/questions`)
      .then((r) => setQuestions(r.data))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [candidate.id])

  const submitAnswer = async (questionId: number) => {
    const text = answers[questionId]?.trim()
    if (!text) return
    setSubmitting(questionId)
    try {
      await questionsApi.patch(`/questions/${questionId}/answer`, { answer: text })
      setAnswers((prev) => { const next = { ...prev }; delete next[questionId]; return next })
      load()
    } finally {
      setSubmitting(null)
    }
  }

  const unanswered = questions.filter((q) => !q.answered)
  const answered = questions.filter((q) => q.answered)

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
        <span className="font-semibold text-gray-800">{candidate.name}</span>
        <span className="text-xs text-gray-500">{candidate.position}</span>
        {unanswered.length > 0 && (
          <span className="ml-auto text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            {unanswered.length} pending
          </span>
        )}
      </div>

      <div className="divide-y">
        {loading ? (
          <p className="px-4 py-3 text-sm text-gray-400 animate-pulse">Loading questions…</p>
        ) : questions.length === 0 ? (
          <p className="px-4 py-3 text-sm text-gray-400 italic">No questions for this candidate.</p>
        ) : (
          <>
            {/* Unanswered first */}
            {unanswered.map((q) => (
              <div key={q.id} className="px-4 py-3 space-y-2">
                <p className="text-sm font-medium text-gray-800">❓ {q.body}</p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Type your answer…"
                    value={answers[q.id] ?? ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && submitAnswer(q.id)}
                  />
                  <button
                    onClick={() => submitAnswer(q.id)}
                    disabled={submitting === q.id || !answers[q.id]?.trim()}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-blue-700"
                  >
                    {submitting === q.id ? '…' : 'Answer'}
                  </button>
                </div>
              </div>
            ))}

            {/* Answered */}
            {answered.map((q) => (
              <div key={q.id} className="px-4 py-3 space-y-1 opacity-70">
                <p className="text-sm text-gray-700">❓ {q.body}</p>
                <p className="text-sm text-green-700 bg-green-50 rounded px-2 py-1">
                  💬 {q.answer}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminQAPage() {
  const { id } = useParams<{ id: string }>()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/elections/${id}/candidates`)
      .then((r) => setCandidates(r.data))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
        <Link to="/admin/elections" className="font-bold text-lg">← TOES Admin</Link>
        <span className="text-sm opacity-70">Election #{id} — Q&amp;A Management</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Candidate Q&amp;A</h1>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white border rounded-xl p-4 h-20 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-gray-500">No candidates registered yet.</p>
        ) : (
          <div className="space-y-4">
            {candidates.map((c) => (
              <CandidateQAPanel key={c.id} candidate={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
