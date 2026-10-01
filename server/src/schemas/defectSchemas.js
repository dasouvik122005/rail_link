import { z } from 'zod'

export const createDefectSchema = z.object({
  body: z.object({
    department: z.string().optional(),
    assetType: z.string().optional(),
    division: z.string().optional(),
    section: z.string().optional(),
    location: z.string().optional(),
    kmMarker: z.string().optional(),
    trackType: z.string().optional(),
    severity: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
    description: z.string().optional(),
    photoUrl: z.string().url('photoUrl must be a valid URL').optional()
  })
})
