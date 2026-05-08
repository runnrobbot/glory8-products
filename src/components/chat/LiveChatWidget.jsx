import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Send, ChevronDown, Loader2 } from 'lucide-react'
import {
  startChatSession,
  getMessages,
  sendMessage,
  subscribeToMessages,
  getSessionById,
} from '@/services/chatService'

const SESSION_KEY = 'glory8_chat_session_id'
const NAME_KEY    = 'glory8_chat_visitor_name'

const STATUS_LABEL = {
  queued:      { text: 'Dalam Antrian', color: '#C9A455' },
  open:        { text: 'Terbuka',       color: '#10B981' },
  in_progress: { text: 'Sedang Dibantu', color: '#3B82F6' },
  closed:      { text: 'Ditutup',       color: '#9C9890' },
}

// ── Form awal pengunjung ──────────────────────────────────────
function StartChatForm({ onStart }) {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', subject: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nama wajib diisi.'); return }
    setError('')
    setLoading(true)
    try {
      await onStart(form)
    } catch (err) {
      setError('Gagal memulai chat. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-[#E8E4DC] px-3 py-2 text-[13px] text-[#1C1917] placeholder:text-[#9C9890] focus:outline-none focus:border-[#C9A455] bg-white'

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
      <p className="text-[12px] text-[#9C9890]" style={{ fontFamily: 'Inter, sans-serif' }}>
        Isi data di bawah untuk memulai konsultasi.
      </p>

      <input
        className={inputCls}
        placeholder="Nama *"
        value={form.name}
        onChange={set('name')}
        required
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
      <input
        className={inputCls}
        placeholder="Email (opsional)"
        type="email"
        value={form.email}
        onChange={set('email')}
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
      <input
        className={inputCls}
        placeholder="WhatsApp (opsional)"
        type="tel"
        value={form.phone}
        onChange={set('phone')}
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
      <input
        className={inputCls}
        placeholder="Topik / Pertanyaan (opsional)"
        value={form.subject}
        onChange={set('subject')}
        style={{ fontFamily: 'Inter, sans-serif' }}
      />

      {error && (
        <p className="text-red-500 text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-[#1C1917] text-white text-[13px] py-2.5 hover:bg-[#C9A455] transition-colors disabled:opacity-60"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        {loading ? 'Memulai...' : 'Mulai Chat'}
      </button>
    </form>
  )
}

// ── Bubble pesan ─────────────────────────────────────────────
function MessageBubble({ msg, visitorName }) {
  const isSystem  = msg.sender_type === 'system'
  const isVisitor = msg.sender_type === 'visitor'

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span
          className="text-[10px] text-[#9C9890] bg-[#F5F3EF] px-3 py-1"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {msg.body}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isVisitor ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[75%] ${isVisitor ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!isVisitor && (
          <span className="text-[10px] text-[#9C9890] px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            {msg.sender_name}
          </span>
        )}
        <div
          className={`px-3 py-2 text-[13px] leading-relaxed ${
            isVisitor
              ? 'bg-[#1C1917] text-white'
              : 'bg-white border border-[#E8E4DC] text-[#1C1917]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif', wordBreak: 'break-word' }}
        >
          {msg.body}
        </div>
        <span className="text-[10px] text-[#9C9890] px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

// ── Main Chat Window ──────────────────────────────────────────
export default function LiveChatWidget() {
  const [open, setOpen]           = useState(false)
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY))
  const [visitorName, setVisitorName] = useState(() => localStorage.getItem(NAME_KEY) || '')
  const [session, setSession]     = useState(null)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)
  const [loadingSession, setLoadingSession] = useState(false)
  const bottomRef = useRef(null)
  const unsubRef  = useRef(null)

  // Auto-scroll
  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  // Load session & messages jika sudah ada sessionId
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    setLoadingSession(true)
    Promise.all([
      getSessionById(sessionId),
      getMessages(sessionId),
    ])
      .then(([sess, msgs]) => {
        if (cancelled) return
        setSession(sess)
        setMessages(msgs)
        scrollBottom()
      })
      .catch(() => {
        if (cancelled) return
        // Session tidak valid / sudah dihapus — reset
        localStorage.removeItem(SESSION_KEY)
        setSessionId(null)
        setSession(null)
        setMessages([])
      })
      .finally(() => { if (!cancelled) setLoadingSession(false) })

    return () => { cancelled = true }
  }, [sessionId, scrollBottom])

  // Realtime subscribe
  useEffect(() => {
    if (!sessionId) return

    // Unsubscribe lama dulu
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }

    unsubRef.current = subscribeToMessages(sessionId, (newMsg) => {
      setMessages(prev => {
        // Deduplicate: hindari pesan duplikat
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
      scrollBottom()
    })

    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    }
  }, [sessionId, scrollBottom])

  // Update session status via realtime
  useEffect(() => {
    if (!sessionId) return
    // Poll session status setiap 10 detik (lightweight)
    const interval = setInterval(async () => {
      try {
        const sess = await getSessionById(sessionId)
        setSession(sess)
      } catch (_) {}
    }, 10000)
    return () => clearInterval(interval)
  }, [sessionId])

  async function handleStart(form) {
    const id = await startChatSession({
      visitorName:  form.name,
      visitorEmail: form.email,
      visitorPhone: form.phone,
      subject:      form.subject,
    })
    localStorage.setItem(SESSION_KEY, id)
    localStorage.setItem(NAME_KEY, form.name)
    setSessionId(id)
    setVisitorName(form.name)
  }

  async function handleSend(e) {
    e?.preventDefault()
    const body = input.trim()
    if (!body || sending || !sessionId) return
    if (session?.status === 'closed') return

    setSending(true)
    const optimisticMsg = {
      id:          `opt-${Date.now()}`,
      session_id:  sessionId,
      sender_type: 'visitor',
      sender_id:   null,
      sender_name: visitorName,
      body,
      created_at:  new Date().toISOString(),
    }
    // Optimistic update
    setMessages(prev => [...prev, optimisticMsg])
    setInput('')
    scrollBottom()

    try {
      const saved = await sendMessage({
        sessionId,
        senderType: 'visitor',
        senderId:   null,
        senderName: visitorName,
        body,
      })
      // Replace optimistic dengan yang real
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? saved : m))
    } catch (_) {
      // Rollback optimistic
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      setInput(body)
    } finally {
      setSending(false)
    }
  }

  function handleReset() {
    if (!confirm('Mulai sesi chat baru? Riwayat chat sebelumnya tidak bisa diakses kembali.')) return
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(NAME_KEY)
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    setSessionId(null)
    setSession(null)
    setMessages([])
    setVisitorName('')
  }

  const statusInfo = session ? STATUS_LABEL[session.status] : null
  const isClosed   = session?.status === 'closed'

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1C1917] text-white flex items-center justify-center shadow-lg hover:bg-[#C9A455] transition-colors"
        aria-label="Live Chat"
      >
        {open
          ? <ChevronDown size={22} strokeWidth={1.5} />
          : <MessageCircle size={22} strokeWidth={1.5} />
        }
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[520px] flex flex-col bg-[#FAF8F4] border border-[#E8E4DC] shadow-2xl"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1C1917] text-white flex-shrink-0">
            <div>
              <p
                className="text-[14px] font-semibold tracking-widest"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                GLORY8
              </p>
              <p className="text-[10px] text-[#C9A455] tracking-wider">Konsultasi & Live Chat</p>
            </div>
            <div className="flex items-center gap-2">
              {statusInfo && (
                <span
                  className="text-[10px] px-2 py-0.5 border"
                  style={{ color: statusInfo.color, borderColor: statusInfo.color }}
                >
                  {statusInfo.text}
                </span>
              )}
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Body */}
          {loadingSession ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#C9A455]" />
            </div>
          ) : !sessionId ? (
            <div className="flex-1 overflow-y-auto">
              <StartChatForm onStart={handleStart} />
            </div>
          ) : (
            <>
              {/* Antrian info */}
              {session?.status === 'queued' && session.queue_position && (
                <div className="px-4 py-2 bg-amber-50 border-b border-[#E8E4DC] flex-shrink-0">
                  <p className="text-[11px] text-amber-700">
                    Posisi antrian Anda: <strong>#{session.queue_position}</strong>. Harap tunggu.
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 min-h-0">
                {messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} visitorName={visitorName} />
                ))}
                {messages.length === 0 && !loadingSession && (
                  <p className="text-center text-[11px] text-[#9C9890] mt-8">
                    Belum ada pesan.
                  </p>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              {isClosed ? (
                <div className="p-3 border-t border-[#E8E4DC] flex-shrink-0 text-center">
                  <p className="text-[11px] text-[#9C9890] mb-2">Sesi ini telah ditutup.</p>
                  <button
                    onClick={handleReset}
                    className="text-[11px] text-[#C9A455] underline hover:no-underline"
                  >
                    Mulai chat baru
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-[#E8E4DC] flex-shrink-0">
                  <input
                    className="flex-1 border border-[#E8E4DC] px-3 py-2 text-[13px] text-[#1C1917] placeholder:text-[#9C9890] focus:outline-none focus:border-[#C9A455] bg-white"
                    placeholder="Tulis pesan..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="w-9 h-9 bg-[#1C1917] text-white flex items-center justify-center hover:bg-[#C9A455] transition-colors disabled:opacity-40 flex-shrink-0"
                  >
                    {sending
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Send size={14} strokeWidth={1.5} />
                    }
                  </button>
                </form>
              )}

              {/* Reset kecil */}
              {!isClosed && (
                <div className="px-3 pb-2 flex-shrink-0">
                  <button
                    onClick={handleReset}
                    className="text-[10px] text-[#9C9890] hover:text-red-400 transition-colors"
                  >
                    Mulai sesi baru
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
