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

export default function ChatBox({ electionId }: { electionId: number }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get(`/elections/${electionId}/chat_messages`).then((r) => setMessages(r.data))
  }, [electionId])

  useEffect(() => {
    const sub = cable.subscriptions.create(
      { channel: 'ChatChannel', election_id: electionId },
      {
        received(msg: Message) {
          setMessages((prev) => [...prev, msg])
        },
      }
    )
    return () => { sub.unsubscribe() }
  }, [electionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!draft.trim() || !user) return
    setSending(true)
    try {
      await api.post(`/elections/${electionId}/chat_messages`, { body: draft.trim() })
      setDraft('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="card flex flex-col h-96 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50 rounded-t-2xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold text-sm text-slate-700">Live Chat</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-8">No messages yet — start the conversation!</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-bold text-indigo-600">{m.sender}</span>
            <span className="text-slate-400 mx-1">›</span>
            <span className="text-slate-700">{m.body}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {user ? (
        <div className="border-t border-slate-100 p-3 flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Say something…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-indigo-700 transition"
          >
            Send
          </button>
        </div>
      ) : (
        <div className="border-t border-slate-100 p-3 text-center text-xs text-slate-400">
          <Link to="/login" className="text-indigo-500 font-semibold hover:underline">Sign in</Link> to join the discussion
        </div>
      )}
    </div>
  )
}
