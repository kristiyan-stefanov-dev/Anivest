import * as z from 'zod';

export const PledgeValidation = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(1).max(256),
  description: z.string().max(2000).optional(),
  amount: z.number().int().positive(),
  estimatedDelivery: z.string().date().optional(),
  quantityLimit: z.number().int().positive().optional(),
  displayOrder: z.number().int().min(0).default(0),
});