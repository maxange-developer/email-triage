# Email Triage AI

AI-powered Gmail inbox dashboard that connects via OAuth, fetches your inbox, and uses Claude to classify every email by priority (high/medium/low/spam), category, urgency, and intent — so you can process your inbox in minutes instead of hours. Includes a streaming reply-suggestion panel, one-click Gmail send, analytics charts, and a Vercel Cron job that keeps your inbox up to date every 5 minutes.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-postgres-green?logo=supabase) ![Anthropic](https://img.shields.io/badge/Anthropic-Claude-orange) ![Gmail API](https://img.shields.io/badge/Gmail-API-red?logo=gmail) ![Vercel](https://img.shields.io/badge/Vercel-deploy-black?logo=vercel)

<!-- DEMO_URL -->

## Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd 03-email-triage
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY,
#          GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
#          NEXTAUTH_SECRET, NEXTAUTH_URL, CRON_SECRET

# 3. Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

## Commands

```bash
pnpm dev          # development server
pnpm build        # production build
pnpm test         # unit tests (Vitest)
pnpm test:watch   # watch mode
pnpm test:e2e     # e2e tests (Playwright)
pnpm seed         # insert 50 demo emails into Supabase
```

## Stack

- **Next.js 16** App Router — Server Components, Server Actions, Route Handlers
- **NextAuth v4** — Google OAuth with Gmail scopes, JWT session, refresh token persistence
- **Supabase** — Postgres DB, Realtime subscriptions for live inbox updates
- **Anthropic Claude** — Haiku for classification (tool_use), Sonnet for streaming reply suggestions
- **Gmail API** — message fetch, MIME parsing, send with thread support
- **Vercel Cron** — `/api/emails/sync` runs every 5 min to keep inbox fresh
- **recharts** — analytics bar chart + donut chart
- **Vitest + Playwright** — unit and e2e test coverage

## Deploy

```bash
vercel link
# Add all env vars from .env.example in the Vercel dashboard
vercel --prod
```
