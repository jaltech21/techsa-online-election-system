import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { PageLayout } from '../components/Navbar'

type Step = 'key' | 'info' | 'photo' | 'done'

export default function CandidateRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('key')
  const [token, setToken] = useState('')
  const [form, setForm] = useState({ name: '', position: '', bio: '', manifesto: '' })
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submitRegistration = async () => {
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('token', token)
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (photo) fd.append('photo', photo)

      await api.post('/candidates/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setStep('done')
    } catch (err: any) {
      const msgs = err.response?.data?.errors ?? [err.response?.data?.error ?? 'Registration failed.']
      setError(msgs.join(', '))
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto mt-16 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">Registration Complete!</h1>
          <p className="text-gray-600 mb-6">Your candidacy has been submitted successfully.</p>
          <button onClick={() => navigate('/elections')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
            View Elections
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-2">Candidate Registration</h1>
        <p className="text-gray-500 mb-6 text-sm">Use the key provided by an administrator to register as a candidate.</p>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {(['key', 'info', 'photo'] as Step[]).map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${
              step === s ? 'bg-blue-600' : i < ['key','info','photo'].indexOf(step) ? 'bg-blue-300' : 'bg-gray-200'
            }`} />
          ))}
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 rounded p-2 mb-4">{error}</p>}

        {step === 'key' && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Registration Key</label>
              <input
                className="w-full border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                placeholder="Paste your key here"
                required
              />
            </div>
            <button
              onClick={() => { setError(''); setStep('info') }}
              disabled={!token}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'info' && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            {(['name', 'position'] as const).map((k) => (
              <div key={k}>
                <label className="block text-sm font-medium mb-1 capitalize">{k}</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  required
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Manifesto</label>
              <textarea
                rows={5}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.manifesto}
                onChange={(e) => setForm({ ...form, manifesto: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('key')} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Back</button>
              <button
                onClick={() => setStep('photo')}
                disabled={!form.name || !form.position}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'photo' && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
              {photo && (
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Preview"
                  className="mt-3 w-24 h-24 rounded-full object-cover border"
                />
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('info')} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Back</button>
              <button
                onClick={submitRegistration}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
