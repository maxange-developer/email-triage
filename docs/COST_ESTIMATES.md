# AI Cost Estimates

All AI calls use OpenAI `gpt-4o-mini` pinned to model version
`gpt-4o-mini-2024-07-18`. The cost guard is enforced in
`src/lib/ai/classify.ts` and `src/lib/ai/suggest-reply.ts`.

## Token pricing

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|-----------------------|------------------------|
| gpt-4o-mini | $0.15 | $0.60 |

## Per-call estimates

### Classification (`classifyEmail`)
- Input: ~400 tokens (system prompt + email header + 1500-char body slice)
- Output: ~80 tokens (JSON object — priority, category, urgency, intent, summary)
- **Cost: ~$0.000108 per email**

### Reply generation (`generateReply`)
- Input: ~300 tokens (system prompt + email header + 1000-char body slice)
- Output: ~200 tokens (3-5 sentence reply, streamed)
- **Cost: ~$0.000165 per reply**

## Demo dataset generation

The pre-generated demo dataset (60 emails × 3 locales × 3 tones = 540
reply variants + translated subjects, bodies, summaries) cost roughly
**$0.23 in total** to produce via `scripts/generate-replies.ts` and
`scripts/translate-mocks.ts`.

Output of those scripts is stored once in `scripts/demo-data.json`, so
running the demo locally via `pnpm demo:seed` costs nothing.

## Cost logging at runtime

Both AI calls emit a structured JSON log line via `lib/logger.ts`:

```json
{ "ns": "classify.cost", "level": "info", "email": "<id>",
  "tokens_in": 412, "tokens_out": 78, "cost_usd": 0.0001088, "t": "..." }

{ "ns": "suggest-reply.cost", "level": "info", "email": "<id>",
  "tokens_in": 287, "tokens_out": 195, "cost_usd": 0.0001601, "t": "..." }
```

Logger output is silenced under `NODE_ENV=test` and routed to Vercel
function logs in production.

## Production cost projection

| Volume | Classification + 1 reply per email |
|--------|------------------------------------|
| 100 emails/day | ~$0.027/day |
| 1,000 emails/day | ~$0.27/day |
| 10,000 emails/day | ~$2.70/day |
