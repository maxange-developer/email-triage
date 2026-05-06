# AI Cost Estimates

## Models

| Operation | Old model | New model |
|-----------|-----------|-----------|
| Classification | claude-haiku-4-5 | gpt-4o-mini |
| Reply generation | claude-sonnet-4-6 | gpt-4o-mini |

## Token pricing (as of May 2026)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|-----------------------|------------------------|
| gpt-4o-mini | $0.15 | $0.60 |
| claude-haiku-4-5 | $0.80 | $4.00 |
| claude-sonnet-4-6 | $3.00 | $15.00 |

## Per-call estimates

### Classification (`classifyEmail`)
- Input: ~400 tokens (system prompt + email header + 1500-char body slice)
- Output: ~80 tokens (JSON object)
- Cost: ~$0.000108 per email

### Reply generation (`generateReply`)
- Input: ~300 tokens (system + email header + 1000-char body slice)
- Output: ~200 tokens (3-5 sentence reply)
- Cost: ~$0.000165 per reply

## Savings vs old stack

| Volume | Old (Haiku classify + Sonnet reply) | New (gpt-4o-mini both) | Saving |
|--------|--------------------------------------|------------------------|--------|
| 100 emails/day | ~$0.46/day | ~$0.027/day | **94%** |
| 1,000 emails/day | ~$4.60/day | ~$0.27/day | **94%** |

## Cost logging

Both calls emit a `console.info` line at runtime:
```
[classify] email=<id> in=<n> out=<n> cost~$0.000108
[suggest-reply] email=<id> in=<n> out=<n> cost~$0.000165
```
