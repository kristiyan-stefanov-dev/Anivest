import * as z from 'zod';

export const projectStatusValidation = z.enum([
  'draft',
  'live',
  'funded',
  'failed',
  'cancelled',
]);

export const ProjectValidation = z.object({
  studioId: z.number().int().positive(),
  title: z.string().min(1).max(256),
  slug: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[a-z0-9-]+$/u, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(1).max(10000),
  targetAmount: z.number().int().positive(),
  currency: z.string().length(3).default('USD'),
  status: projectStatusValidation.default('draft'),
  deadline: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
});