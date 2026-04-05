import React, { useState } from 'react'
import { PageLayout } from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  /* ── Profile form ── */
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  /* ── Password form ── */
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition placeholder:text-slate-400 bg-white'

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    if (!name.trim()) { setProfileError('Name is required.'); return }
    setProfileSaving(true)
    try {
      const { data } = await api.patch('/auth/profile', { name: name.trim(), email: email.trim() })
      updateUser(data)
      setProfileSuccess('Profile updated successfully.')
    } catch (err: any) {
      setProfileError(err.response?.data?.errors?.[0] ?? 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (newPassword !== confirmPassword) { setPwError('New passwords do not match.'); return }
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return }
    setPwSaving(true)
    try {
      await api.patch('/auth/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      setPwSuccess('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPwError(err.response?.data?.error ?? err.response?.data?.errors?.[0] ?? 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  const EyeOpen = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
  const EyeOff = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )

  return (
    <PageLayout>
      <div className="max-w-xl mx-auto py-6">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">My Account</h1>
          <p className="text-slate-500 text-sm mt-1">Update your name, email, and password.</p>
        </div>

        {/* ── Personal information ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Personal Information
          </h2>

          {/* Read-only student ID */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Student ID</label>
            <input
              disabled
              value={user?.student_id ?? ''}
              className="w-full border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
            />
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                className={inputCls}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Amara Koroma"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@umt.edu"
                required
              />
            </div>

            {profileError && (
              <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">✓ {profileSuccess}</p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={profileSaving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm shadow-indigo-200"
              >
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Change password ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Change Password
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className={`${inputCls} pr-11`}
                  placeholder="Your current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
                <button type="button" tabIndex={-1} onClick={() => setShowCurrent(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition">
                  {showCurrent ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  className={`${inputCls} pr-11`}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
                <button type="button" tabIndex={-1} onClick={() => setShowNew(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition">
                  {showNew ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                className={inputCls}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {pwError && (
              <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">{pwError}</p>
            )}
            {pwSuccess && (
              <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">✓ {pwSuccess}</p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={pwSaving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm shadow-indigo-200"
              >
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}
