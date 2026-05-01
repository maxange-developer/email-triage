import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }))
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: mockCreate } }
  }),
}))

import { classifyEmail } from '@/lib/ai/classify'

const baseEmail = {
  id: 'email-1',
  from_name: 'Mario Rossi',
  from_address: 'mario@example.com',
  subject: 'Test',
  body_plain: 'Hello world',
}

const validToolUseBlock = {
  type: 'tool_use',
  id: 'tu_1',
  name: 'classify_email',
  input: {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 2,
    intent: 'Needs help',
    summary: 'Client needs help with project',
  },
}

describe('classifyEmail', () => {
  beforeEach(() => mockCreate.mockReset())

  it('happy path — returns Classification from valid tool_use', async () => {
    mockCreate.mockResolvedValue({ content: [validToolUseBlock] })
    const result = await classifyEmail(baseEmail)
    expect(result.priority).toBe('high')
    expect(result.category).toBe('client_request')
    expect(result.urgency_hours).toBe(2)
  })

  it('API error — propagates thrown error', async () => {
    mockCreate.mockImplementationOnce(() => { throw new Error('Network error') })
    await expect(classifyEmail(baseEmail)).rejects.toThrow('Network error')
  })

  it('no tool_use block — throws with "no tool_use block"', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'some text' }] })
    await expect(classifyEmail(baseEmail)).rejects.toThrow(/no tool_use block/i)
  })

  it('body truncated — calls API with body sliced to 2000 chars', async () => {
    mockCreate.mockResolvedValue({ content: [validToolUseBlock] })
    const longBody = 'x'.repeat(3000)
    await classifyEmail({ ...baseEmail, body_plain: longBody })
    const call = mockCreate.mock.calls[0][0]
    const prompt: string = call.messages[0].content
    // The sliced body should appear, not the full 3000 chars
    const bodySection = prompt.split('Body:\n')[1]
    expect(bodySection.length).toBeLessThanOrEqual(2000)
  })
})
