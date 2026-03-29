import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

export default function AdminLoginPage() {
  const { adminLogin } = useAdminAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(form.username, form.password)
      navigate('/admin/elections')
    } catch {
      setError('Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-2xl font-bold text-center mb-8">🗳️ Admin Dashboard</h1>
        <form onSubmit={submit} className="bg-white rounded-xl p-6 space-y-4 shadow-xl">
          {error && <p className="text-red-600 text-sm bg-red-50 rounded p-2">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
