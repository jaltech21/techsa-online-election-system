import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../lib/api'
import AdminShell from '../../components/admin/AdminShell'

// Shared axios instance that adds admin Bearer token
import axios from 'axios'
const questionsApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : '/api/v1',
})
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
    <AdminShell title="Q&A Management" subtitle={`Election #${id} — answer candidate questions`}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem', height: '5rem', animation: 'skeleton 1.4s ease-in-out infinite' }}>
              <div style={{ height: '0.875rem', background: '#e2e8f0', borderRadius: '0.375rem', width: '33%', marginBottom: '0.375rem' }} />
              <div style={{ height: '0.625rem', background: '#f1f5f9', borderRadius: '0.375rem', width: '50%' }} />
            </div>
          ))}
          <style>{`@keyframes skeleton { 0%,100%{opacity:1} 50%{opacity:0.55} }`}</style>
        </div>
      ) : candidates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: 'white', borderRadius: '0.875rem', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❓</div>
          <p style={{ margin: 0 }}>No candidates registered yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {candidates.map((c) => (
            <CandidateQAPanel key={c.id} candidate={c} />
          ))}
        </div>
      )}
    </AdminShell>
  )
}
