import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminApi, useAdminAuth } from '../../hooks/useAdminAuth'

function ElectionSkeleton() {
  return (
    <div className="bg-white border rounded-xl p-4 flex items-center gap-4 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/5" />
        <div className="h-3 bg-gray-100 rounded w-1/5" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-gray-200 rounded-lg" />
        <div className="h-8 w-20 bg-gray-200 rounded-lg" />
        <div className="h-8 w-16 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}

interface Election {
  id: number; title: string; status: string; created_at: string
}

export default function AdminElectionsPage() {
  const { admin: adminNullable, adminLogout } = useAdminAuth()
  const admin = adminNullable! // RequireAdmin guard ensures this is set
  const navigate = useNavigate()
  const [elections, setElections] = useState<Election[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(true)

  const load = () => adminApi.get('/elections').then((r) => setElections(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await adminApi.post('/elections', form)
    setForm({ title: '', description: '' })
    setShowCreate(false)
    load()
  }

  const toggle = async (id: number) => {
    await adminApi.patch(`/elections/${id}/toggle_status`)
    load()
  }

  const logout = () => { adminLogout(); navigate('/admin') }



  const statusBadge = (s: string) => {
    const cls: Record<string, string> = { open: 'bg-green-100 text-green-700', closed: 'bg-red-100 text-red-700', draft: 'bg-gray-100 text-gray-600' }
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls[s] ?? cls.draft}`}>{s.toUpperCase()}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin nav */}
      <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
        <span className="font-bold text-lg">🗳️ TOES Admin</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="opacity-70">{admin.username}</span>
          <button onClick={logout} className="bg-white text-gray-900 px-3 py-1 rounded font-semibold hover:bg-gray-100">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Elections</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            + New Election
          </button>
        </div>

        {showCreate && (
          <form onSubmit={create} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
            <h2 className="font-semibold">Create Election</h2>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="border px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700">Create</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <ElectionSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {elections.map((e) => (
              <div key={e.id} className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{e.title}</span>
                    {statusBadge(e.status)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link to={`/admin/elections/${e.id}/keys`} className="border px-3 py-1 rounded-lg hover:bg-gray-50">Keys</Link>
                  <Link to={`/admin/elections/${e.id}/analytics`} className="border px-3 py-1 rounded-lg hover:bg-gray-50">Analytics</Link>
                  <Link to={`/admin/elections/${e.id}/qa`} className="border px-3 py-1 rounded-lg hover:bg-gray-50">Q&amp;A</Link>
                  <button
                    onClick={() => toggle(e.id)}
                    className={`px-3 py-1 rounded-lg font-semibold ${
                      e.status === 'draft' ? 'bg-green-600 text-white hover:bg-green-700'
                      : e.status === 'open' ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {e.status === 'draft' ? 'Open' : e.status === 'open' ? 'Close' : 'Reopen'}
                  </button>
                </div>
              </div>
            ))}
            {elections.length === 0 && <p className="text-gray-500">No elections yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
