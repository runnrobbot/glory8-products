import { supabase } from '@/lib/supabase'

// ── Visitor: memulai chat baru ────────────────────────────────
export async function startChatSession({ visitorName, visitorEmail, visitorPhone, subject }) {
  const { data, error } = await supabase.rpc('enqueue_chat_session', {
    p_visitor_name:  visitorName,
    p_visitor_email: visitorEmail || null,
    p_visitor_phone: visitorPhone || null,
    p_subject:       subject      || null,
  })
  if (error) throw error
  return data // session_id (uuid)
}

// ── Visitor: ambil session by ID ─────────────────────────────
export async function getSessionById(sessionId) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  if (error) throw error
  return data
}

// ── Visitor/Staff: ambil pesan di satu session ───────────────
export async function getMessages(sessionId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// ── Kirim pesan ──────────────────────────────────────────────
// senderType: 'visitor' | 'staff'
// senderId: null untuk visitor
export async function sendMessage({ sessionId, senderType, senderId, senderName, body }) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id:  sessionId,
      sender_type: senderType,
      sender_id:   senderId || null,
      sender_name: senderName,
      body,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Staff: ambil semua session (dengan filter status) ────────
export async function getSessions({ status } = {}) {
  let query = supabase
    .from('chat_sessions')
    .select(`
      *,
      assigned_profile:profiles!chat_sessions_assigned_to_fkey(id, full_name)
    `)
    .order('queue_position', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ── Staff: assign session ke diri sendiri ────────────────────
export async function assignSession(sessionId, staffId) {
  const { data, error } = await supabase.rpc('assign_chat_session', {
    p_session_id: sessionId,
    p_staff_id:   staffId,
  })
  if (error) throw error
  return data // boolean
}

// ── Staff: ubah status session secara manual ─────────────────
export async function updateSessionStatus(sessionId, newStatus) {
  const updates = { status: newStatus }
  if (newStatus === 'open' || newStatus === 'in_progress') {
    // clear closed fields jika re-open
    updates.closed_at = null
    updates.closed_by = null
  }
  const { error } = await supabase
    .from('chat_sessions')
    .update(updates)
    .eq('id', sessionId)
  if (error) throw error
}

// ── Staff/Visitor: close session via function ────────────────
export async function closeSession(sessionId, closedBy) {
  const { error } = await supabase.rpc('close_chat_session', {
    p_session_id: sessionId,
    p_closed_by:  closedBy,
  })
  if (error) throw error
}

// ── Admin: hapus session (dan semua pesan cascade) ───────────
export async function deleteSession(sessionId) {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)
  if (error) throw error
}

// ── Realtime: subscribe ke pesan di satu session ─────────────
// Mengembalikan unsubscribe function
export function subscribeToMessages(sessionId, onMessage) {
  const channel = supabase
    .channel(`messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'chat_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => onMessage(payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ── Realtime: subscribe ke daftar session (untuk admin panel) ─
export function subscribeToSessions(onChange) {
  const channel = supabase
    .channel('chat_sessions_list')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chat_sessions' },
      onChange
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
