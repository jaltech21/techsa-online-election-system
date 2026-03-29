import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminApi } from '../../hooks/useAdminAuth'

interface Key {
  id: number; token: string; used: boolean; candidate_id?: number; created_at: string
}

export default function AdminKeysPage() {
  const { id } = useParams<{ id: string }>()
  const [keys, setKeys] = useState<Key[]>([])
  const [count, setCount] = useState(1)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<number | null>(null)

  const load = () => adminApi.get(`/elections/${id}/registration_keys`).then((r) => setKeys(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  const generate = async () => {
    await adminApi.post(`/elections/${id}/registration_keys/generate`, { count })
    load()
  }

  const copy = (token: string, keyId: number) => {
    navigator.clipboard.writeText(token)
    setCopied(keyId)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
        <Link to="/admin/elections" className="font-bold text-lg">← TOES Admin</Link>
        <span className="text-sm opacity-70">Election #{id} — Registration Keys</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Registration Keys</h1>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1} max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-16 border rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={generate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              Generate
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] text-xs font-semibold text-gray-500 px-4 py-2 border-b bg-gray-50">
            <span>TOKEN</span><span>STATUS</span><span></span>
          </div>
          {loading ? (
            <p className="p-4 text-gray-500 text-sm">Loading…</p>
          ) : keys.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">No keys yet. Generate some above.</p>
          ) : (
            keys.map((k) => (
              <div key={k.id} className="grid grid-cols-[1fr_auto_auto] items-center px-4 py-2.5 border-b last:border-0 gap-3">
                <code className="text-xs text-gray-700 truncate">{k.token}</code>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${k.used ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                  {k.used ? 'USED' : 'UNUSED'}
                </span>
                <button
                  onClick={() => copy(k.token, k.id)}
                  className="text-xs border px-2 py-1 rounded hover:bg-gray-50"
                >
                  {copied === k.id ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {keys.filter((k) => !k.used).length} unused · {keys.filter((k) => k.used).length} used
        </p>
      </div>
    </div>
  )
}
