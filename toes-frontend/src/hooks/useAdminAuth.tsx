import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

const adminApi = axios.create({ baseURL: '/api/v1/admin' })

interface AdminUser { id: number; username: string }
interface AdminAuthCtx {
  admin: AdminUser | null
  adminToken: string | null
  adminLogin: (username: string, password: string) => Promise<void>
  adminLogout: () => void
}

const AdminAuthContext = createContext<AdminAuthCtx | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const s = localStorage.getItem('admin')
    return s ? JSON.parse(s) : null
  })
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('admin_token'))

  adminApi.interceptors.request.use((config) => {
    const t = localStorage.getItem('admin_token')
    if (t) config.headers.Authorization = `Bearer ${t}`
    return config
  })

  const adminLogin = async (username: string, password: string) => {
    const { data } = await adminApi.post('/auth/login', { username, password })
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin', JSON.stringify(data.admin))
    setAdminToken(data.token)
    setAdmin(data.admin)
  }

  const adminLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin')
    setAdminToken(null)
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, adminToken, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider')
  return ctx
}

export { adminApi }
