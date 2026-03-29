import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageLayout } from '../components/Navbar'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ student_id: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(form.student_id, form.password)
      navigate('/elections')
    } catch {
      setError('Invalid student ID or password.')
    }
  }

  return (
    <PageLayout>
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Student Login</h1>
        <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 rounded p-2">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Student ID</label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
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
        <p className="text-center text-sm mt-4 text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </PageLayout>
  )
}
