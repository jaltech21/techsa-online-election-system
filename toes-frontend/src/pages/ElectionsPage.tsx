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
  const cls: Record<string, string> = {
    open: 'badge-open',
    closed: 'badge-closed',
    draft: 'badge-draft',
  }
  return <span className={cls[status] ?? cls.draft}>{status.toUpperCase()}</span>
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/elections').then((r) => setElections(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <PageLayout>
      <div className="animate-pulse space-y-4">
        <div className="h-7 bg-slate-200 rounded-xl w-32 mb-8" />
        {[0,1,2].map(i => (
          <div key={i} className="card p-6 h-20">
            <div className="h-4 bg-slate-200 rounded w-2/5 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-3/5" />
          </div>
        ))}
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Elections</h1>
        <p className="text-slate-500 mt-1">Cast your vote and make your voice count.</p>
      </div>

      {elections.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🗳️</p>
          <p className="font-semibold text-slate-600">No elections available right now.</p>
          <p className="text-slate-400 text-sm mt-1">Check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {elections.map((e) => (
            <Link
              key={e.id}
              to={`/elections/${e.id}`}
              className="card block p-6 hover:border-indigo-400 hover:shadow-md transition-all duration-150 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{e.title}</h2>
                  {e.description && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{e.description}</p>}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {statusBadge(e.status)}
                  <span className="text-indigo-500 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
