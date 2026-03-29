import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageLayout } from '../components/Navbar'

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
    <PageLayout>
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 rounded p-2">{error}</p>}
          {field('student_id', 'Student ID')}
          {field('name', 'Full Name')}
          {field('email', 'Email (optional)', 'email')}
          {field('password', 'Password', 'password')}
          {field('password_confirmation', 'Confirm Password', 'password')}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </PageLayout>
  )
}
