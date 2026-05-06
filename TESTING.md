# Testing Guide — Email Triage (Mock Mode)

Test the full UI without Google OAuth or Anthropic API.

## Setup

### 1. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXTAUTH_SECRET=any-random-string
NEXTAUTH_URL=http://localhost:3000
USE_MOCK_AUTH=true
USE_MOCK_AI=true
```

> Anthropic and Google OAuth keys are **not needed** in mock mode.

### 2. Seed 50 realistic emails

```bash
pnpm seed:mock
```

Inserts 10 HIGH + 20 MEDIUM + 15 LOW + 5 SPAM emails for `test@angel1.dev`.  
Run again to reset (existing mock emails are deleted first).

### 3. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you are automatically logged in as **Massi Angelone** (`test@angel1.dev`).

---

## What works in mock mode

| Feature | Mock behaviour |
|---------|---------------|
| Login | Redirected straight to `/app` — no OAuth |
| Inbox | Shows all 50 seeded emails grouped by priority |
| Email detail | Full view with body, summary, category |
| Suggest reply | Streams pre-written `ai_suggested_reply` word-by-word (no API call) |
| Mark handled | Updates DB normally |
| Send reply | Returns success without calling Gmail |
| Insights | Analytics computed from seeded emails |
| Settings | Save classification rules works normally |
| Gmail sync | Returns `{ count: 0 }` immediately — no Gmail call |

---

## Switching back to production mode

Set in `.env.local`:

```
USE_MOCK_AUTH=false
USE_MOCK_AI=false
```

And provide real `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `ANTHROPIC_API_KEY`.
