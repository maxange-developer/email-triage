-- Decouple from auth.users (NextAuth JWT-only: no Supabase Auth session exists)
-- user_id will store session.user.email (text, unique per Google account)

-- Drop FK constraints
alter table users_settings drop constraint users_settings_user_id_fkey;
alter table emails drop constraint emails_user_id_fkey;

-- Drop PK before changing column type
alter table users_settings drop constraint users_settings_pkey;

-- Change user_id to text
alter table users_settings alter column user_id type text using user_id::text;
alter table emails alter column user_id type text using user_id::text;
alter table emails alter column user_id set not null;

-- Restore PK
alter table users_settings add primary key (user_id);

-- Add history_id for incremental Gmail sync tracking
alter table users_settings add column if not exists history_id text;

-- Drop auth.uid() RLS policy (requires Supabase Auth session, incompatible with NextAuth)
drop policy if exists "users see own emails" on emails;
-- RLS remains ENABLED; all server writes use service role which bypasses RLS
