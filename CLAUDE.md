# Project: email-triage

## Stack
- next@16 · App Router · typescript strict · tailwindcss@4 · shadcn/ui (base-nova)
- next-auth@4 · @auth/supabase-adapter · Google OAuth (Gmail scope)
- supabase: auth + db · @supabase/ssr
- anthropic SDK · claude-sonnet-4-6
- zod · lucide-react
- vitest (unit) · playwright (e2e) · deploy: vercel

## Context
AI email triage dashboard. Connects to Gmail via OAuth, fetches inbox,
classifies and summarises emails with Claude. Single-user, no multi-tenancy.

## Structure
- src/app/ — App Router routes · src/components/ — UI (shadcn-style)
- src/lib/ai/ — Claude prompts · src/lib/db/ — Supabase queries
- src/lib/gmail/ — Gmail API helpers · src/lib/validations/ — Zod schemas
- src/components/inbox/ · src/components/email-detail/ · src/components/insights/
- supabase/migrations/ — SQL · tests/unit/ — Vitest · tests/e2e/ — Playwright

## Commands
```bash
pnpm dev · pnpm build · pnpm test · pnpm test:e2e · gh pr create
```

## Rules
1. Zod schema in lib/validations/ — validate before any logic
2. Server Actions over Route Handlers for mutations
3. Never expose stack traces or internals to client
4. Supabase RLS by default — service role: inline comment required
5. SDK first (Anthropic) — raw fetch only as fallback
6. DB access from Server Components/Actions only — never Client Components
7. New env var → .env.example updated immediately
8. Return `{ success, data, error }` from Server Actions
9. Mobile-first (375px) · loading + error + empty states required
10. Gmail tokens stored encrypted in Supabase — never in localStorage

## Forbidden
- `as Type` cast without runtime check
- `console.log` in prod (use lib/logger.ts)
- Hardcoded API keys or OAuth tokens

## Pre-commit
- [ ] pnpm build passes · [ ] pnpm test passes
- [ ] No console errors · [ ] 375px verified
- [ ] RLS in place for new tables · [ ] .env.example updated

Context files: read docs/ on demand
