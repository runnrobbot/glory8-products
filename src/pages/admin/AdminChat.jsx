import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Clock, CheckCircle, XCircle, Loader2, Send, Trash2, UserCheck, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  getSessions,
  getMessages,
  sendMessage,
  assignSession,
  closeSession,
  deleteSession,
  updateSessionStatus,
  subscribeToMessages,
  subscribeToSessions,
} from '@/services/chatService'
import toast from 'react-hot-toast'

// ── Konstanta ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  queued:      { label: 'Antrian',     color: '#C9A455', bg: '#FEF9EE', icon: Clock },
  open:        { label: 'Terbuka',     color: '#10B981', bg: '#F0FDF4', icon: MessageCircle },
  in_progress: { label: 'Diproses',    color: '#3B82F6', bg: '#EFF6FF', icon: UserCheck },
  closed:      { label: 'Ditutup',     color: '#9C9890', bg: '#F9FAFB', icon: XCircle },
}

const STATUS_TABS = ['all', 'queued', 'open', 'in_progress', 'closed']

// ── Badge status ─────────────────────────────────────────────
function StatusBadge({ status, small }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.closed
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium`}
      style={{ color: cfg.color, background: cfg.bg, fontFamily: 'Inter, sans-serif' }}
    >
      <Icon size={10} strokeWidth={2} />
      {cfg.label}
    </span>
  )
}

// ── Bubble pesan ─────────────────────────────────────────────
function MsgBubble({ msg }) {
  const isSystem  = msg.sender_type === 'system'
  const isVisitor = msg.sender_type === 'visitor'

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[10px] text-[#9C9890] bg-[#F5F3EF] px-3 py-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          {msg.body}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isVisitor ? 'justify-start' : 'justify-end'} mb-2`}>
      <div className={`max-w-[70%] flex flex-col gap-0.5 ${isVisitor ? 'items-start' : 'items-end'}`}>
        <span className="text-[10px] text-[#9C9890] px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          {msg.sender_name}
          {!isVisitor && ' (Staff)'}
        </span>
        <div
          className={`px-3 py-2 text-[13px] leading-relaxed ${
            isVisitor
              ? 'bg-white border border-[#E8E4DC] text-[#1C1917]'
              : 'bg-[#1C1917] text-white'
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

// ── Panel chat kanan ─────────────────────────────────────────
function ChatPanel({ session, profile, role, onSessionUpdated }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const bottomRef  = useRef(null)
  const unsubRef   = useRef(null)

  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  // Load messages saat session berubah
  useEffect(() => {
    if (!session) return
    let cancelled = false
    setLoading(true)

    getMessages(session.id)
      .then(msgs => { if (!cancelled) { setMessages(msgs); scrollBottom() } })
      .catch(() => { if (!cancelled) setMessages([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [session?.id, scrollBottom])

  // Realtime pesan
  useEffect(() => {
    if (!session) return
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }

    unsubRef.current = subscribeToMessages(session.id, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
      scrollBottom()
    })

    return () => { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null } }
  }, [session?.id, scrollBottom])

  async function handleSend(e) {
    e?.preventDefault()
    const body = input.trim()
    if (!body || sending || !session) return

    setSending(true)
    const optimistic = {
      id: `opt-${Date.now()}`,
      session_id: session.id,
      sender_type: 'staff',
      sender_id: profile.id,
      sender_name: profile.full_name,
      body,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setInput('')
    scrollBottom()

    try {
      const saved = await sendMessage({
        sessionId:  session.id,
        senderType: 'staff',
        senderId:   profile.id,
        senderName: profile.full_name,
        body,
      })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? saved : m))
    } catch (_) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(body)
      toast.error('Gagal mengirim pesan.')
    } finally {
      setSending(false)
    }
  }

  async function handleAssign() {
    try {
      const ok = await assignSession(session.id, profile.id)
      if (ok) {
        toast.success('Session berhasil diambil.')
        onSessionUpdated()
      } else {
        toast.error('Session sudah diambil staff lain.')
      }
    } catch (_) {
      toast.error('Gagal assign session.')
    }
  }

  async function handleClose() {
    if (!confirm(`Tutup sesi chat dengan ${session.visitor_name}?`)) return
    try {
      await closeSession(session.id, profile.id)
      toast.success('Sesi ditutup.')
      onSessionUpdated()
    } catch (_) {
      toast.error('Gagal menutup sesi.')
    }
  }

  async function handleReopen() {
    try {
      await updateSessionStatus(session.id, 'open')
      toast.success('Sesi dibuka kembali.')
      onSessionUpdated()
    } catch (_) {
      toast.error('Gagal membuka sesi.')
    }
  }

  async function handleDelete() {
    if (!confirm(`Hapus PERMANEN sesi chat dengan ${session.visitor_name}? Semua pesan akan ikut terhapus.`)) return
    try {
      await deleteSession(session.id)
      toast.success('Sesi dihapus.')
      onSessionUpdated()
    } catch (_) {
      toast.error('Gagal menghapus sesi.')
    }
  }

  const isAdmin  = ['super_admin', 'admin'].includes(role)
  const isClosed = session.status === 'closed'
  const isAssignedToMe = session.assigned_to === profile.id
  const canTakeOver = session.status === 'queued' || session.status === 'open'

  return (
    <div className="flex flex-col h-full">
      {/* Header session */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-[#E8E4DC] bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[15px] font-semibold text-[#1C1917]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {session.visitor_name}
              </h2>
              <StatusBadge status={session.status} />
              {session.queue_position && session.status !== 'closed' && (
                <span className="text-[10px] text-[#9C9890]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Antrian #{session.queue_position}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {session.visitor_email && (
                <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {session.visitor_email}
                </span>
              )}
              {session.visitor_phone && (
                <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {session.visitor_phone}
                </span>
              )}
              {session.subject && (
                <span className="text-[11px] text-[#9C9890] italic" style={{ fontFamily: 'Inter, sans-serif' }}>
                  "{session.subject}"
                </span>
              )}
            </div>
            {session.assigned_profile && (
              <p className="text-[10px] text-[#3B82F6] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                Ditangani: {session.assigned_profile.full_name}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {canTakeOver && !isAssignedToMe && (
              <button
                onClick={handleAssign}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] text-white text-[11px] hover:bg-[#C9A455] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <UserCheck size={12} strokeWidth={1.5} />
                Ambil
              </button>
            )}
            {!isClosed && (
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E4DC] text-[#1C1917] text-[11px] hover:border-[#9C9890] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <XCircle size={12} strokeWidth={1.5} />
                Tutup
              </button>
            )}
            {isClosed && isAdmin && (
              <button
                onClick={handleReopen}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E4DC] text-[#1C1917] text-[11px] hover:border-[#9C9890] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <RefreshCw size={12} strokeWidth={1.5} />
                Buka Lagi
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 text-[11px] hover:bg-red-50 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Trash2 size={12} strokeWidth={1.5} />
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#FAF8F4] min-h-0">
        {loading ? (
          <div className="flex justify-center mt-8">
            <Loader2 size={20} className="animate-spin text-[#C9A455]" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-[12px] text-[#9C9890] mt-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Belum ada pesan.
          </p>
        ) : (
          messages.map(msg => <MsgBubble key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isClosed ? (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 p-3 border-t border-[#E8E4DC] bg-white flex-shrink-0"
        >
          <input
            className="flex-1 border border-[#E8E4DC] px-3 py-2 text-[13px] text-[#1C1917] placeholder:text-[#9C9890] focus:outline-none focus:border-[#C9A455] bg-white"
            placeholder="Tulis balasan..."
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 bg-[#1C1917] text-white flex items-center justify-center hover:bg-[#C9A455] transition-colors disabled:opacity-40 flex-shrink-0"
          >
            {sending
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} strokeWidth={1.5} />
            }
          </button>
        </form>
      ) : (
        <div className="px-4 py-3 border-t border-[#E8E4DC] bg-white text-center flex-shrink-0">
          <p className="text-[11px] text-[#9C9890]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sesi ini sudah ditutup. Tidak ada pesan baru yang bisa dikirim.
          </p>
        </div>
      )}
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function AdminChat() {
  const { profile, role } = useAuthStore()

  const [sessions, setSessions]         = useState([])
  const [activeTab, setActiveTab]       = useState('all')
  const [selectedId, setSelectedId]     = useState(null)
  const [loading, setLoading]           = useState(true)
  const [reloading, setReloading]       = useState(false)

  const selectedSession = sessions.find(s => s.id === selectedId)

  // Load sessions
  const loadSessions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setReloading(true)
    try {
      const data = await getSessions()
      setSessions(data)
    } catch (_) {
      toast.error('Gagal memuat daftar chat.')
    } finally {
      setLoading(false)
      setReloading(false)
    }
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])

  // Realtime sessions list
  useEffect(() => {
    const unsub = subscribeToSessions(() => loadSessions(true))
    return unsub
  }, [loadSessions])

  // Filter sessions by tab
  const filtered = sessions.filter(s => activeTab === 'all' || s.status === activeTab)

  // Count per tab
  const counts = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  function handleSessionUpdated() {
    loadSessions(true)
    // Jika session yang aktif dihapus, deselect
    if (selectedId) {
      const still = sessions.find(s => s.id === selectedId)
      if (!still) setSelectedId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#C9A455]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Page title */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1
            className="text-[22px] text-[#1C1917]"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}
          >
            Live Chat
          </h1>
          <p className="text-[12px] text-[#9C9890] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Kelola konsultasi & percakapan pengunjung
          </p>
        </div>
        <button
          onClick={() => loadSessions(true)}
          disabled={reloading}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#E8E4DC] text-[12px] text-[#9C9890] hover:text-[#1C1917] transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <RefreshCw size={12} strokeWidth={1.5} className={reloading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Main panel */}
      <div className="flex flex-1 border border-[#E8E4DC] bg-white overflow-hidden min-h-0">

        {/* Left: session list */}
        <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col border-r border-[#E8E4DC]">
          {/* Tabs */}
          <div className="flex flex-wrap gap-0 border-b border-[#E8E4DC] flex-shrink-0">
            {STATUS_TABS.map(tab => {
              const count = tab === 'all' ? sessions.length : (counts[tab] || 0)
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedId(null) }}
                  className={`flex-1 px-2 py-2.5 text-[10px] border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-[#1C1917] text-[#1C1917] font-semibold'
                      : 'border-transparent text-[#9C9890] hover:text-[#1C1917]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {tab === 'all' ? 'Semua' : STATUS_CONFIG[tab]?.label}
                  {count > 0 && (
                    <span className="ml-1 text-[9px] bg-[#F5F3EF] px-1 py-0.5">{count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-[#9C9890]">
                <MessageCircle size={24} strokeWidth={1} />
                <p className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Tidak ada chat
                </p>
              </div>
            ) : (
              filtered.map(sess => {
                const isSelected = selectedId === sess.id
                const cfg = STATUS_CONFIG[sess.status]
                return (
                  <button
                    key={sess.id}
                    onClick={() => setSelectedId(sess.id)}
                    className={`w-full text-left px-4 py-3 border-b border-[#F5F3EF] hover:bg-[#FAF8F4] transition-colors ${
                      isSelected ? 'bg-[#FAF8F4] border-l-2 border-l-[#C9A455]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[13px] text-[#1C1917] font-medium truncate"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {sess.visitor_name}
                        </p>
                        {sess.subject && (
                          <p className="text-[11px] text-[#9C9890] truncate mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {sess.subject}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={sess.status} />
                          {sess.queue_position && sess.status !== 'closed' && (
                            <span className="text-[9px] text-[#9C9890]">#{sess.queue_position}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#9C9890] flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {new Date(sess.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right: chat detail */}
        <div className="flex-1 min-w-0">
          {selectedSession ? (
            <ChatPanel
              key={selectedSession.id}
              session={selectedSession}
              profile={profile}
              role={role}
              onSessionUpdated={handleSessionUpdated}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#9C9890]">
              <MessageCircle size={40} strokeWidth={1} />
              <p className="text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Pilih sesi chat dari daftar kiri
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
