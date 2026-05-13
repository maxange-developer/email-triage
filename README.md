# Email Triage

AI inbox dashboard. Classifies every Gmail email by priority, category,
urgency and intent, then drafts a reply in your tone of voice. Connects
via OAuth, runs on Next.js and OpenAI.

**Live demo →** [email-triage-lime.vercel.app](https://email-triage-lime.vercel.app)

One-click demo entry, no Google account required. Three pre-configured
inboxes in Italian, English and Spanish.

## What it does

Connects to a Gmail account, fetches recent emails, classifies each one
with a structured AI call (priority `high|medium|low|spam`, category,
urgency in hours, sender intent, one-line summary), and produces a
drafted reply on demand in three tones — professional, friendly, formal
— across three locales. Send-via-Gmail emits proper SMTP threading
headers (`In-Reply-To`, `References`) so the reply continues the thread
in Outlook and Apple Mail, not just in Gmail.

## Quick start

```bash
git clone https://github.com/maxange-developer/email-triage.git
cd email-triage
pnpm install
cp .env.example .env.local
# Edit .env.local with your Supabase URL + service role key.
# Mock flags are pre-set to true — no Google or OpenAI key needed.

pnpm demo:seed   # populates Supabase with 60 demo emails
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and click
"Enter demo". The 60 emails, 3 mock accounts and 540 pre-generated
reply variants come from `scripts/demo-data.json` — no OpenAI calls
required.

## What's interesting

**Multi-tone pre-generation.** All 540 reply combinations (60 emails
× 3 locales × 3 tones) are pre-generated with `gpt-4o-mini` and
stored in a single `ai_suggested_replies` JSONB column. In demo mode
the route handler streams them back via SSE with chunked delivery
(12 chars, 35ms apart) so the perceived UX matches a real AI call
without spending a cent at runtime.

**Editable subject + correct threading.** Reply subject is prepended
with `Re:` via an idempotent helper (no `Re: Re:` artefacts), then
the field is editable inline. Outgoing messages include `In-Reply-To`
and `References` SMTP headers built from the original Gmail message
ID, so threading survives across mail clients.

**Per-account classification rules.** Each connected Gmail account
has its own `from_contains → priority` overrides stored in a JSON map
in `users_settings`. The AI classification runs first, then rules can
override the priority before the email lands in the inbox view.

**Cost-pinned model.** Both AI calls hard-code
`gpt-4o-mini-2024-07-18`. A comment in `classify.ts` and
`suggest-reply.ts` blocks accidental upgrades to `gpt-4o`. Each call
also logs a structured cost line — see [docs/COST_ESTIMATES.md](docs/COST_ESTIMATES.md).

## Demo mode

Set the four mock flags in `.env.local`:

```bash
USE_MOCK_AUTH=true
USE_MOCK_AI=true
USE_MOCK_DATA=true
NEXT_PUBLIC_USE_MOCK=true
```

The app then:

- Skips Google OAuth (the demo user has 3 pre-set Gmail accounts in
  three languages)
- Reads emails from `emails_mock`, not `emails`
- Streams replies from the pre-generated JSONB rather than calling OpenAI
- Treats `Send via Gmail` as a no-op with a success toast

To run a real-flavour test against your own Gmail, flip all four flags
to `false` and supply `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`. The hidden `/login/dev` route exposes the OAuth
flow.

## Stack

- **Next.js 16** — App Router, Server Actions, Route Handlers
- **NextAuth v4** — Google OAuth with Gmail scopes, JWT session
- **Supabase** — Postgres, service-role queries in mock mode
- **OpenAI** `gpt-4o-mini` — classification + reply generation
- **Gmail API** — read + send with thread headers
- **Recharts** — analytics charts
- **Vitest + Playwright** — 27 unit tests + e2e stub

## Cost

Generating the demo dataset (translations + 3-tone reply matrix
for 60 emails) cost ~$0.23 in total via `gpt-4o-mini`. After the
one-time dump in `scripts/demo-data.json`, the demo runs at zero
cost.

Real usage: ~$0.0003 per email (classification + one reply drafted).
Detail: [docs/COST_ESTIMATES.md](docs/COST_ESTIMATES.md).

## Repo structure

```
src/
  app/                    # Next.js App Router pages + API routes
  components/             # UI (editorial-light design system)
  contexts/               # AccountContext for multi-account state
  i18n/                   # client-side locale provider (it/en/es)
  lib/
    ai/                   # classify + suggest-reply (OpenAI)
    db/                   # Supabase queries (emails, analytics)
    gmail/                # Gmail API (fetch, parse, send)
    utils/                # buildReplySubject, email-locale
    validations/          # Zod schemas
    logger.ts             # structured JSON logging
scripts/                  # demo data export/seed/audit
supabase/migrations/      # database schema (001-006)
tests/
  unit/                   # Vitest, 27 tests
  e2e/                    # Playwright stub
```

## License

MIT.

## Author

Built by Massimiliano Angelone as part of a portfolio of AI-enhanced
MVPs. Based in Tenerife.
