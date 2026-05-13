-- Add JSONB column for multi-tone replies
-- Both emails and emails_mock; defensive to schema differences between them.

-- emails table (production)
ALTER TABLE emails
  ADD COLUMN IF NOT EXISTS ai_suggested_replies JSONB DEFAULT '{}'::JSONB;

-- emails_mock table (demo data)
ALTER TABLE emails_mock
  ADD COLUMN IF NOT EXISTS ai_suggested_replies JSONB DEFAULT '{}'::JSONB;

-- Backfill emails: only ai_suggested_reply exists in this table
-- Map the single-tone reply to 'professional' across all locales
UPDATE emails SET ai_suggested_replies = jsonb_build_object(
  'it', jsonb_build_object('professional', COALESCE(ai_suggested_reply, ''), 'friendly', '', 'formal', ''),
  'en', jsonb_build_object('professional', COALESCE(ai_suggested_reply, ''), 'friendly', '', 'formal', ''),
  'es', jsonb_build_object('professional', COALESCE(ai_suggested_reply, ''), 'friendly', '', 'formal', '')
)
WHERE ai_suggested_replies IS NULL OR ai_suggested_replies = '{}'::JSONB;

-- Backfill emails_mock: has all 4 fields, use the locale-suffixed ones with fallback
UPDATE emails_mock SET ai_suggested_replies = jsonb_build_object(
  'it', jsonb_build_object('professional', COALESCE(ai_suggested_reply_it, ai_suggested_reply, ''), 'friendly', '', 'formal', ''),
  'en', jsonb_build_object('professional', COALESCE(ai_suggested_reply_en, ai_suggested_reply, ''), 'friendly', '', 'formal', ''),
  'es', jsonb_build_object('professional', COALESCE(ai_suggested_reply_es, ai_suggested_reply, ''), 'friendly', '', 'formal', '')
)
WHERE ai_suggested_replies IS NULL OR ai_suggested_replies = '{}'::JSONB;