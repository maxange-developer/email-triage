import { z } from 'zod'

export const ClassificationRuleSchema = z.object({
  from_contains: z.string().optional(),
  subject_contains: z.string().optional(),
  force_priority: z.enum(['high', 'medium', 'low', 'spam']).optional(),
})
export const ClassificationRulesSchema = z.array(ClassificationRuleSchema)
export type ClassificationRule = z.infer<typeof ClassificationRuleSchema>
