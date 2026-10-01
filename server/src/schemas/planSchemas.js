import { z } from 'zod'

export const createPlanSchema = z.object({
  body: z.object({
    section: z.string().optional(),
    date: z.string().optional(),
    duration: z.number().positive().optional(),
    department: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    blockRequests: z.array(z.string()).optional()
  })
})
