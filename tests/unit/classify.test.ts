import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { EmailForClassification } from '@/lib/validations/email'

const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }))

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function () {
    return { chat: { completions: { create: mockCreate } } }
  }),
}))

import { classifyEmail } from '@/lib/ai/classify'

const baseEmail: EmailForClassification = {
  id: 'email-1',
  from_name: 'Mario Rossi',
  from_address: 'mario@example.com',
  subject: 'Bug report',
  body_plain: 'There is a critical bug in checkout',
}

function makeResponse(payload: object, usage = { prompt_tokens: 120, completion_tokens: 40 }) {
  return {
    choices: [{ message: { content: JSON.stringify(payload) } }],
    usage,
  }
}

describe('classifyEmail', () => {
  beforeEach(() => mockCreate.mockReset())

  it('parses a valid response into a typed Classification', async () => {
    mockCreate.mockResolvedValue(makeResponse({
      priority: 'high',
      category: 'client_request',
      urgency_hours: 4,
      intent: 'Reports a critical bug',
      summary: 'Critical checkout bug needs immediate attention',
    }))

    const result = await classifyEmail(baseEmail)
    expect(result.priority).toBe('high')
    expect(result.category).toBe('client_request')
    expect(result.urgency_hours).toBe(4)
    expect(mockCreate).toHaveBeenCalledOnce()
  })

  it('calls OpenAI with the cost-pinned gpt-4o-mini model and JSON response format', async () => {
    mockCreate.mockResolvedValue(makeResponse({
      priority: 'low',
      category: 'newsletter',
      urgency_hours: 168,
      intent: 'x',
      summary: 'x',
    }))

    await classifyEmail(baseEmail)
    const args = mockCreate.mock.calls[0][0]
    expect(args.model).toBe('gpt-4o-mini-2024-07-18')
    expect(args.response_format).toEqual({ type: 'json_object' })
  })

  it('truncates body to 1500 chars before sending to OpenAI', async () => {
    mockCreate.mockResolvedValue(makeResponse({
      priority: 'medium',
      category: 'support',
      urgency_hours: 24,
      intent: 'x',
      summary: 'x',
    }))

    const longBody = 'x'.repeat(3000)
    await classifyEmail({ ...baseEmail, body_plain: longBody })

    const userMessage: string = mockCreate.mock.calls[0][0].messages[1].content
    const bodySection = userMessage.split('Body:\n')[1] ?? ''
    expect(bodySection.length).toBeLessThanOrEqual(1500)
  })

  it('throws when OpenAI returns empty content', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
      usage: { prompt_tokens: 10, completion_tokens: 0 },
    })

    await expect(classifyEmail(baseEmail)).rejects.toThrow(/empty response/i)
  })

  it('throws when OpenAI returns malformed JSON', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'not valid json {{{' } }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    })

    await expect(classifyEmail(baseEmail)).rejects.toThrow()
  })

  it('throws via Zod when priority is outside the allowed enum', async () => {
    mockCreate.mockResolvedValue(makeResponse({
      priority: 'super-urgent',
      category: 'client_request',
      urgency_hours: 4,
      intent: 'x',
      summary: 'x',
    }))

    await expect(classifyEmail(baseEmail)).rejects.toThrow()
  })

  it('propagates network errors from the OpenAI client', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Network error'))
    await expect(classifyEmail(baseEmail)).rejects.toThrow('Network error')
  })
})
