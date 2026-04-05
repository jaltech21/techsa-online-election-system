import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import api from '../lib/api'

interface User {
  id: number
  student_id: string
  name: string
  email?: string
  has_voted: boolean
  candidate_id?: number | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (student_id: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  updateUser: (updated: User) => void
  logout: () => void
  loading: boolean
}

interface RegisterData {
  student_id: string
  name: string
  email?: string
  password: string
  password_confirmation: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (token && !user) {
      api.get('/auth/me').then((r) => setUser(r.data)).catch(() => logout())
    }
    // intentionally mount-only — token/user are the initial persisted values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (student_id: string, password: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { student_id, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData: RegisterData) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', formData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (updated: User) => {
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
