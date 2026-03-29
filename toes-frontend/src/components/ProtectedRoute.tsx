import React from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAdminAuth } from '../hooks/useAdminAuth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/elections" replace />
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { admin } = useAdminAuth()
  if (!admin) return <Navigate to="/admin" replace />
  return <>{children}</>
}
