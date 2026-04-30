# Architectural Decisions — email-triage

## Auth
next-auth@4 + @auth/supabase-adapter — avoids custom JWT handling; Google OAuth built-in

## Gmail tokens
Refresh token stored in users_settings (Supabase, RLS) — never in localStorage or cookies

## AI
claude-sonnet-4-6 for classification + summaries — single model, no embedding needed

## Forms / mutations
Server Actions over Route Handlers — type-safe, less boilerplate

## Components
shadcn/ui base-nova copied — full control, no upstream lock-in
