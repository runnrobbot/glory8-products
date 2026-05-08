-- ============================================================
-- Glory8 — Live Chat & Queue System
-- Migration 003
-- ============================================================

-- ============================================================
-- CHAT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Identitas visitor
  visitor_name  text NOT NULL,
  visitor_email text,
  visitor_phone text,
  -- Status
  status        text NOT NULL DEFAULT 'queued'
                CHECK (status IN ('queued', 'open', 'in_progress', 'closed')),
  -- Staff yang handle
  assigned_to   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  -- Topik awal
  subject       text,
  -- Antrian: position di-handle via DB function agar atomik
  queue_position int,
  -- Timestamps
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  closed_at     timestamptz,
  -- Metadata
  closed_by     uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index untuk query umum
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status       ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_assigned_to  ON chat_sessions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_queue_pos    ON chat_sessions(queue_position) WHERE status = 'queued';

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  -- sender_type: 'visitor' | 'staff' | 'system'
  sender_type text NOT NULL CHECK (sender_type IN ('visitor', 'staff', 'system')),
  sender_id   uuid REFERENCES profiles(id) ON DELETE SET NULL, -- null = visitor
  sender_name text NOT NULL,
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session  ON chat_messages(session_id, created_at);

-- ============================================================
-- FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_chat_session_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_sessions_updated ON chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE PROCEDURE update_chat_session_timestamp();

-- ============================================================
-- FUNCTION: Enqueue chat session (atomik, no race condition)
-- Dipanggil saat visitor submit chat baru.
-- Menggunakan ADVISORY LOCK agar tidak ada dua session
-- yang mendapat queue_position yang sama secara bersamaan.
-- ============================================================
CREATE OR REPLACE FUNCTION enqueue_chat_session(
  p_visitor_name  text,
  p_visitor_email text DEFAULT NULL,
  p_visitor_phone text DEFAULT NULL,
  p_subject       text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id    uuid;
  v_next_position int;
BEGIN
  -- Advisory lock: kunci sementara agar hanya 1 proses bisa enqueue sekaligus
  PERFORM pg_advisory_xact_lock(123456789);

  -- Hitung posisi berikutnya (MAX + 1 dari semua yang masih queued/open/in_progress)
  SELECT COALESCE(MAX(queue_position), 0) + 1
    INTO v_next_position
    FROM chat_sessions
   WHERE status IN ('queued', 'open', 'in_progress');

  INSERT INTO chat_sessions (
    visitor_name, visitor_email, visitor_phone, subject,
    status, queue_position
  )
  VALUES (
    p_visitor_name, p_visitor_email, p_visitor_phone, p_subject,
    'queued', v_next_position
  )
  RETURNING id INTO v_session_id;

  -- Pesan sistem otomatis
  INSERT INTO chat_messages (session_id, sender_type, sender_name, body)
  VALUES (
    v_session_id,
    'system',
    'System',
    'Sesi chat dimulai. Posisi antrian Anda: ' || v_next_position || '. Harap tunggu, staf kami akan segera membantu.'
  );

  RETURN v_session_id;
END;
$$;

-- ============================================================
-- FUNCTION: Staff mengambil / assign session (atomik)
-- Mencegah dua staff assign ke session yang sama.
-- ============================================================
CREATE OR REPLACE FUNCTION assign_chat_session(
  p_session_id uuid,
  p_staff_id   uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated int;
BEGIN
  UPDATE chat_sessions
     SET status      = 'in_progress',
         assigned_to = p_staff_id
   WHERE id          = p_session_id
     AND status IN ('queued', 'open')  -- hanya bisa assign jika belum in_progress
     AND (assigned_to IS NULL OR assigned_to = p_staff_id);

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated > 0 THEN
    -- Pesan sistem
    INSERT INTO chat_messages (session_id, sender_type, sender_id, sender_name, body)
    SELECT p_session_id, 'system', p_staff_id, p.full_name,
           p.full_name || ' bergabung ke percakapan ini.'
      FROM profiles p WHERE p.id = p_staff_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- ============================================================
-- FUNCTION: Tutup session (hanya admin yang bisa delete,
-- tapi siapa pun bisa close)
-- ============================================================
CREATE OR REPLACE FUNCTION close_chat_session(
  p_session_id uuid,
  p_closed_by  uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE chat_sessions
     SET status    = 'closed',
         closed_at = now(),
         closed_by = p_closed_by
   WHERE id = p_session_id
     AND status != 'closed';

  INSERT INTO chat_messages (session_id, sender_type, sender_id, sender_name, body)
  SELECT p_session_id, 'system', p_closed_by, p.full_name,
         'Sesi chat ditutup oleh ' || p.full_name || '.'
    FROM profiles p WHERE p.id = p_closed_by;
END;
$$;

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- chat_sessions: siapa yang bisa baca?
-- Staff/Admin/SuperAdmin: semua session
-- Visitor (anon): hanya session miliknya sendiri (via session_id di URL)
CREATE POLICY "Staff see all sessions"
  ON chat_sessions FOR SELECT
  USING (is_staff_or_higher());

-- Visitor bisa baca session-nya sendiri (kita pakai visitor_email match atau anon — 
-- untuk simplisitas visitor tidak login, jadi SELECT by id = open)
-- Visitor insert via function enqueue_chat_session (SECURITY DEFINER), tidak perlu policy INSERT.

CREATE POLICY "Staff update sessions"
  ON chat_sessions FOR UPDATE
  USING (is_staff_or_higher());

-- Hanya admin yang bisa DELETE session
CREATE POLICY "Admin delete sessions"
  ON chat_sessions FOR DELETE
  USING (is_admin());

-- INSERT: hanya lewat function (anon) — tapi kita juga izinkan anon insert agar function berjalan
CREATE POLICY "Anyone can insert session"
  ON chat_sessions FOR INSERT
  WITH CHECK (true);

-- chat_messages: SELECT
CREATE POLICY "Staff see all messages"
  ON chat_messages FOR SELECT
  USING (is_staff_or_higher());

-- Visitor bisa SELECT pesan di session mereka — kita izinkan select all untuk realtime widget
-- (visitor tidak login, session_id sudah dipegang di local)
CREATE POLICY "Public see messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone insert message"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Tidak ada UPDATE / DELETE pesan (immutable chat log)
-- Kecuali admin bisa hapus seluruh session (CASCADE delete messages)

-- ============================================================
-- REALTIME: aktifkan untuk kedua tabel
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
