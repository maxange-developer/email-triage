create table users_settings (
  user_id uuid primary key references auth.users,
  google_refresh_token text,
  email_address text,
  classification_rules jsonb default '[]',
  created_at timestamptz default now()
);

create table emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  gmail_message_id text unique not null,
  thread_id text,
  from_address text,
  from_name text,
  subject text,
  snippet text,
  body_plain text,
  received_at timestamptz,
  priority text check (priority in ('high','medium','low','spam')),
  category text,
  urgency_hours int,
  intent text,
  ai_summary text,
  ai_suggested_reply text,
  is_processed boolean default false,
  is_handled boolean default false,
  created_at timestamptz default now()
);

create index on emails (user_id, priority, is_handled);
create index on emails (user_id, received_at desc);

alter table emails enable row level security;
create policy "users see own emails"
  on emails for all using (user_id = auth.uid());
