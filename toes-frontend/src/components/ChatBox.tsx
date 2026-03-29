import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import cable from '../lib/cable'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'

interface Message {
  id: number
  body: string
  sender: string
  created_at: string
}

interface Props {
  electionId: number
  isOpen: boolean
  onClose: () => void
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatBox({ electionId, isOpen, onClose }: Props) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [onlineCount, setOnlineCount] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get(`/elections/${electionId}/chat_messages`).then((r) => setMessages(r.data))
  }, [electionId])

  useEffect(() => {
    const sub = cable.subscriptions.create(
      { channel: 'ChatChannel', election_id: electionId },
      {
        received(msg: Message) {
          // Deduplicate: skip if we already have this ID (from optimistic update)
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          )
        },
        connected() { setOnlineCount((c) => c + 1) },
        disconnected() { setOnlineCount((c) => Math.max(1, c - 1)) },
      }
    )
    return () => { sub.unsubscribe() }
  }, [electionId])

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [messages, isOpen])

  const send = async () => {
    if (!draft.trim() || !user) return
    const body = draft.trim()
    const tempId = -(Date.now()) // negative so it never clashes with a real DB id
    const optimistic: Message = { id: tempId, body, sender: user.name, created_at: new Date().toISOString() }

    // Show the message immediately for the sender
    setMessages((prev) => [...prev, optimistic])
    setDraft('')
    setSending(true)
    try {
      const res = await api.post(`/elections/${electionId}/chat_messages`, { body })
      // Swap temp id → real server id so the coming broadcast is deduplicated correctly
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...optimistic, id: res.data.id } : m))
      )
    } catch {
      // Roll back the optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      {/* Popup panel — anchored bottom-right */}
      <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[390px] flex flex-col"
           style={{ maxHeight: '88vh' }}>
        <div className="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">

          {/* Header */}
          <div className="px-5 py-4 flex items-start justify-between border-b border-slate-100 shrink-0">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <svg className="w-[18px] h-[18px] text-indigo-600" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-bold text-slate-800 text-[15px]">Live Election Chat</span>
              </div>
              <div className="flex items-center gap-1.5 ml-[26px]">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-slate-400">
                  {onlineCount} user{onlineCount !== 1 ? 's' : ''} online
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[260px] max-h-[420px]">
            {messages.length === 0 && (
              <p className="text-center text-slate-400 text-sm mt-12">
                No messages yet — be the first!
              </p>
            )}
            {messages.map((m) => {
              const isOwn = m.sender === user?.name
              return (
                <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}>
                      {m.body}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">
                      {isOwn ? 'You' : m.sender} · {fmt(m.created_at)}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          {user ? (
            <div className="border-t border-slate-100 px-3 py-3 bg-slate-50 flex items-center gap-2 shrink-0">
              <input
                ref={inputRef}
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400"
                placeholder="Type a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              />
              <button
                onClick={send}
                disabled={sending || !draft.trim()}
                className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-indigo-700 disabled:opacity-40 transition active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 text-center text-sm text-slate-500 shrink-0">
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>{' '}
              to join the discussion
            </div>
          )}
        </div>
      </div>
    </>
  )
}
