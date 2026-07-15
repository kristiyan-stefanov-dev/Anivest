import * as z from 'zod';

export const StudioValidation = z.object({
  name: z.string().min(1).max(256),
  slug: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[a-z0-9-]+$/u, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
});