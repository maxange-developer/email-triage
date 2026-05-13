-- emails_mock: demo/portfolio table used when USE_MOCK_DATA=true.
-- Mirrors the shape of `emails` plus locale-suffixed columns
-- (subject/body/ai_summary/intent/ai_suggested_reply for it/en/es)
-- and a JSONB column storing pre-generated multi-tone replies
-- as { it|en|es: { professional, friendly, formal } }.
--
-- Schema retrofitted from the existing production table on
-- 2026-05-14 (table was originally created manually in Supabase
-- Studio before migrations were tracked).

CREATE TABLE IF NOT EXISTS emails_mock (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT,
  gmail_message_id TEXT,
  thread_id TEXT,
  from_address TEXT,
  from_name TEXT,
  subject TEXT,
  subject_it TEXT,
  subject_en TEXT,
  subject_es TEXT,
  snippet TEXT,
  body_plain TEXT,
  body_it TEXT,
  body_en TEXT,
  body_es TEXT,
  received_at TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('high','medium','low','spam')),
  category TEXT,
  urgency_hours INTEGER,
  intent TEXT,
  intent_it TEXT,
  intent_en TEXT,
  intent_es TEXT,
  ai_summary TEXT,
  ai_summary_it TEXT,
  ai_summary_en TEXT,
  ai_summary_es TEXT,
  ai_suggested_reply TEXT,
  ai_suggested_reply_it TEXT,
  ai_suggested_reply_en TEXT,
  ai_suggested_reply_es TEXT,
  ai_suggested_replies JSONB DEFAULT '{}'::JSONB,
  is_processed BOOLEAN DEFAULT FALSE,
  is_handled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS emails_mock_account_idx ON emails_mock(account_id);
CREATE INDEX IF NOT EXISTS emails_mock_user_idx ON emails_mock(user_id);
CREATE INDEX IF NOT EXISTS emails_mock_priority_idx ON emails_mock(priority);

-- Demo table: no RLS (consistent with 003_disable_rls.sql).
ALTER TABLE emails_mock DISABLE ROW LEVEL SECURITY;
