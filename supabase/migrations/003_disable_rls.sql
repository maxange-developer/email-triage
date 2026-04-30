-- Single-user app: RLS not needed (no multi-tenancy, all writes via service role)
alter table emails disable row level security;
alter table users_settings disable row level security;
