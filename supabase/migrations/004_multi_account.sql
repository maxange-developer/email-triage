-- Multi-account support: each user can connect multiple Gmail accounts
-- user_id = session.user.email (text, from NextAuth)

-- New table: one row per connected Gmail account
create table if not exists gmail_accounts (
  id text primary key default gen_random_uuid()::text,
  user_id text not null,
  email_address text not null,
  display_name text,
  google_refresh_token text,
  google_access_token text,
  is_primary boolean default false,
  created_at timestamptz default now(),
  unique(user_id, email_address)
);

-- Link each email to the account it was fetched from
alter table emails
  add column if not exists account_id text;

-- Track which account the user last viewed
alter table users_settings
  add column if not exists active_account_id text;

-- Performance indexes for account-scoped queries
create index if not exists emails_account_idx
  on emails (account_id, priority, is_handled);
create index if not exists emails_account_date_idx
  on emails (account_id, received_at desc);
