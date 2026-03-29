import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { AdminAuthProvider } from './hooks/useAdminAuth'
import { RequireAuth, RequireGuest, RequireAdmin } from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ElectionsPage from './pages/ElectionsPage'
import ElectionDetailPage from './pages/ElectionDetailPage'
import CandidateRegisterPage from './pages/CandidateRegisterPage'

import LandingPage from './pages/LandingPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminElectionsPage from './pages/admin/AdminElectionsPage'
import AdminKeysPage from './pages/admin/AdminKeysPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminQAPage from './pages/admin/AdminQAPage'

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/elections" element={<ElectionsPage />} />
            <Route path="/elections/:id" element={<ElectionDetailPage />} />
            <Route path="/candidates/register" element={<CandidateRegisterPage />} />

            {/* Auth */}
            <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
            <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
            <Route path="/admin/elections" element={<RequireAdmin><AdminElectionsPage /></RequireAdmin>} />
            <Route path="/admin/elections/:id/keys" element={<RequireAdmin><AdminKeysPage /></RequireAdmin>} />
            <Route path="/admin/elections/:id/analytics" element={<RequireAdmin><AdminAnalyticsPage /></RequireAdmin>} />
            <Route path="/admin/elections/:id/qa" element={<RequireAdmin><AdminQAPage /></RequireAdmin>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/elections" replace />} />
          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
