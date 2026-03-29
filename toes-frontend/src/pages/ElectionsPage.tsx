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

const statusBadge = (status: string) => {
  const classes: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${classes[status] ?? classes.draft}`}>
      {status.toUpperCase()}
    </span>
  )
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/elections').then((r) => setElections(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLayout><p className="text-gray-500">Loading elections…</p></PageLayout>

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold mb-6">Elections</h1>
      {elections.length === 0 ? (
        <p className="text-gray-500">No elections available right now.</p>
      ) : (
        <div className="space-y-4">
          {elections.map((e) => (
            <Link
              key={e.id}
              to={`/elections/${e.id}`}
              className="block bg-white border rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{e.title}</h2>
                  {e.description && <p className="text-gray-500 text-sm mt-1">{e.description}</p>}
                </div>
                {statusBadge(e.status)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
