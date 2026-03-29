import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    student_id: '', name: '', email: '', password: '', password_confirmation: '',
  })
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      return
    }
    try {
      await register(form)
      navigate('/elections')
    } catch (err: any) {
      const msgs = err.response?.data?.errors
      setError(msgs ? msgs.join(', ') : 'Registration failed.')
    }
  }

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required={key !== 'email'}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-white font-extrabold text-2xl">
            <span className="bg-white/20 rounded-xl px-3 py-1">🗳️</span> TOES
          </span>
          <p className="text-indigo-200 text-sm mt-2">TECHSA Online Election System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <h1 className="text-xl font-bold text-slate-800">Create your account</h1>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}
          <form onSubmit={submit} className="space-y-4">
            {field('student_id', 'Student ID')}
            {field('name', 'Full Name')}
            {field('email', 'Email (optional)', 'email')}
            {field('password', 'Password', 'password')}
            {field('password_confirmation', 'Confirm Password', 'password')}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
