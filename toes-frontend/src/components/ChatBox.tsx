import React, { useEffect, useRef, useState } from 'react'
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
    <div className="border rounded-xl flex flex-col h-96 bg-white">
      <div className="px-4 py-2 border-b font-semibold text-sm text-gray-700">💬 Live Chat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-semibold text-blue-700">{m.sender}: </span>
            <span className="text-gray-800">{m.body}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {user && (
        <div className="border-t p-2 flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Say something..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}
