import { z } from 'zod'

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    role: z.enum(['admin', 'planner', 'engg', 'snt', 'trd', 'viewer']).optional()
  })
})
